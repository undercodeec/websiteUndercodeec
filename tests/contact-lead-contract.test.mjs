import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Extract only the real callbacks/helpers. Importing server.js would start the
// server and importing db.js would connect to MySQL and initialize its schema.
const source = readFileSync(new URL("../backend/server.js", import.meta.url), "utf8");
const ast = ts.createSourceFile("server.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
assert.equal(ast.parseDiagnostics.length, 0, "server.js must parse without errors");

function appCalls(method) {
  return ast.statements.flatMap((statement, index) => {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) return [];
    const call = statement.expression;
    if (call.expression.getText(ast) !== `app.${method}`) return [];
    return [{ call, index }];
  });
}

const routes = [
  { path: "/api/send-contact", formType: "contacto", isSuccess: (body) => body.status === "success" },
  { path: "/api/send-marketing", formType: "marketing", isSuccess: (body) => body.success === true },
].map((route) => {
  const registration = appCalls("post").find(({ call }) =>
    ts.isStringLiteral(call.arguments[0]) && call.arguments[0].text === route.path,
  );
  assert.ok(registration, `${route.path} must be registered`);
  const callback = registration.call.arguments.at(-1);
  assert.ok(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback));
  return { ...route, index: registration.index, callback: callback.getText(ast) };
});

const alias = appCalls("use").find(({ call }) =>
  call.arguments.length === 1 && ts.isArrowFunction(call.arguments[0])
    && call.arguments[0].getText(ast).includes("req.body['g-recaptcha-response']"),
);
assert.ok(alias, "the existing reCAPTCHA alias middleware must be registered");

const helperNames = [
  "saveLeadToDB", "escapeHtml", "escapeFieldsForHtml", "verifyRecaptcha", "sendUserConfirmationEmail",
];
const helpers = helperNames.map((name) => {
  const declaration = ast.statements.find((statement) =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === name,
  );
  assert.ok(declaration, `${name} must exist`);
  return declaration.getText(ast);
}).join("\n");

const privateError = "synthetic-token private@example.invalid SMTP-password";

function harness(route, options = {}) {
  const calls = { queries: [], mails: [], assessments: [], logs: [], responses: [], sequence: [] };
  const context = vm.createContext({
    process: { env: {
      EMAIL_USER: "business@example.invalid",
      RECAPTCHA_PROJECT_ID: "test-project",
      RECAPTCHA_API_KEY: "test-api-key",
      RECAPTCHA_SITE_KEY: "test-site-key",
      ...options.env,
    } },
    console: Object.fromEntries(["log", "error"].map((method) => [
      method, (...args) => calls.logs.push(args.map(String).join(" ")),
    ])),
    db: { query: async (sql, values) => {
      calls.queries.push({ sql, values });
      calls.sequence.push("db");
      if (options.dbFails) throw new Error(privateError);
      return options.dbResult ?? { rows: [{ id: 42 }] };
    } },
    transporter: { sendMail: async (message) => {
      calls.mails.push(message);
      calls.sequence.push("email");
      if (calls.mails.length === options.mailFailsAt) throw new Error(privateError);
      return { messageId: "mock-message" };
    } },
    axios: { post: async (url, payload, config) => {
      calls.assessments.push({ url, payload, config });
      return { data: {
        tokenProperties: { valid: options.captchaValid !== false, invalidReason: "INVALID" },
        riskAnalysis: { score: options.captchaScore ?? 0.9 },
      } };
    } },
  });
  vm.runInContext(helpers, context, { timeout: 1_000 });
  const handler = vm.runInContext(`(${route.callback})`, context, { timeout: 1_000 });
  const normalize = vm.runInContext(`(${alias.call.arguments[0].getText(ast)})`, context, { timeout: 1_000 });

  return {
    calls,
    async submit(overrides = {}) {
      const req = { body: {
        name: "Test contact", nombre: "Test marketing", email: "test@example.invalid",
        phone: "+593000000000", telefono: "+593000000000", message: "Test request",
        empresa: "Test company", objetivo: "Test objective", plan: "Test plan",
        recaptchaToken: "synthetic-token", ...overrides,
      } };
      let normalized = false;
      normalize(req, {}, () => { normalized = true; });
      assert.equal(normalized, true);
      const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) {
          calls.responses.push({ status: this.statusCode, body });
          return this;
        },
      };
      await handler(req, res);
      assert.equal(calls.responses.length, 1, "one request must receive one response");
      return calls.responses[0];
    },
  };
}

function assertNoPrivateLogs(calls) {
  assert.doesNotMatch(calls.logs.join("\n"), /synthetic-token|private@example\.invalid|SMTP-password/);
}

test("JSON parsing and token normalization precede both form routes", () => {
  const parser = appCalls("use").find(({ call }) =>
    ts.isCallExpression(call.arguments[0])
      && call.arguments[0].expression.getText(ast) === "express.json",
  );
  assert.ok(parser);
  assert.ok(parser.index < alias.index);
  for (const route of routes) assert.ok(alias.index < route.index);
});

for (const route of routes) {
  test(`${route.formType}: DB rejection returns an error without sending emails`, async () => {
    const h = harness(route, { dbFails: true });
    const result = await h.submit();
    assert.equal(result.status, 500);
    assert.equal(route.isSuccess(result.body), false);
    assert.equal(h.calls.queries.length, 1);
    assert.equal(h.calls.mails.length, 0);
    assertNoPrivateLogs(h.calls);
  });

  for (const rows of [[], [{}], [{ id: null }]]) {
    test(`${route.formType}: no saved ID (${JSON.stringify(rows)}) cannot report success`, async () => {
      const h = harness(route, { dbResult: { rows } });
      const result = await h.submit();
      assert.equal(result.status, 500);
      assert.equal(route.isSuccess(result.body), false);
      assert.equal(h.calls.queries.length, 1);
      assert.equal(h.calls.mails.length, 0);
    });
  }

  test(`${route.formType}: saved lead produces one INSERT and success after persistence`, async () => {
    const h = harness(route);
    const result = await h.submit();
    assert.equal(result.status, 200);
    assert.equal(route.isSuccess(result.body), true);
    assert.equal(h.calls.queries.length, 1);
    assert.match(h.calls.queries[0].sql, /INSERT INTO leads/);
    assert.equal(h.calls.queries[0].values[0], route.formType);
    assert.equal(h.calls.mails.length, 2);
    assert.deepEqual(h.calls.sequence, ["db", "email", "email"]);
    assertNoPrivateLogs(h.calls);
  });

  for (const mailFailsAt of [1, 2]) {
    test(`${route.formType}: email ${mailFailsAt} failure keeps the persisted lead successful`, async () => {
      const h = harness(route, { mailFailsAt });
      const result = await h.submit();
      assert.equal(result.status, 200);
      assert.equal(route.isSuccess(result.body), true);
      assert.equal(h.calls.queries.length, 1, "SMTP failure must not retry the INSERT");
      assert.equal(h.calls.mails.length, 2, "each notification is attempted independently");
      assertNoPrivateLogs(h.calls);
    });
  }

  test(`${route.formType}: Google widget alias reaches the verifier`, async () => {
    const h = harness(route);
    const result = await h.submit({ recaptchaToken: undefined, "g-recaptcha-response": "widget-token" });
    assert.equal(result.status, 200);
    assert.equal(route.isSuccess(result.body), true);
    assert.equal(h.calls.assessments.length, 1);
    assert.equal(h.calls.assessments[0].payload.event.token, "widget-token");
  });

  test(`${route.formType}: explicit canonical token takes precedence over the alias`, async () => {
    const h = harness(route);
    const result = await h.submit({ "g-recaptcha-response": "different-alias" });
    assert.equal(result.status, 200);
    assert.equal(h.calls.assessments[0].payload.event.token, "synthetic-token");
  });

  for (const recaptchaToken of [undefined, 123]) {
    test(`${route.formType}: missing/non-string token (${recaptchaToken}) blocks persistence`, async () => {
      const h = harness(route);
      const result = await h.submit({ recaptchaToken });
      assert.equal(result.status, 400);
      assert.equal(route.isSuccess(result.body), false);
      assert.equal(h.calls.assessments.length, 0);
      assert.equal(h.calls.queries.length, 0);
      assert.equal(h.calls.mails.length, 0);
    });
  }

  for (const options of [{ captchaValid: false }, { captchaScore: 0.1 }]) {
    test(`${route.formType}: rejected captcha (${JSON.stringify(options)}) blocks persistence`, async () => {
      const h = harness(route, options);
      const result = await h.submit({ "g-recaptcha-response": "valid-looking-alias" });
      assert.equal(result.status, 400);
      assert.equal(route.isSuccess(result.body), false);
      assert.equal(h.calls.assessments[0].payload.event.token, "synthetic-token");
      assert.equal(h.calls.queries.length, 0);
      assert.equal(h.calls.mails.length, 0);
    });
  }

  test(`${route.formType}: missing captcha configuration fails closed`, async () => {
    const h = harness(route, { env: { RECAPTCHA_API_KEY: "" } });
    const result = await h.submit();
    assert.equal(result.status, 500);
    assert.equal(route.isSuccess(result.body), false);
    assert.equal(h.calls.assessments.length, 0);
    assert.equal(h.calls.queries.length, 0);
    assert.equal(h.calls.mails.length, 0);
  });
}
