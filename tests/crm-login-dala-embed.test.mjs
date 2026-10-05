import assert from "node:assert/strict";
import test from "node:test";

test("CRM Dala embed prepares a light scene before loading original styles and scripts", async () => {
  const { GET } = await import("../src/app/admin/crm/login/dala-embed/route.js");
  const response = await GET();
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.match(html, /<base href="\/demos\/dala\/">/);
  assert.match(html, /<canvas id="canvas"><\/canvas>/);
  assert.match(html, /<script src="js\/theme\.js"><\/script>/);

  const preparedBackground = html.indexOf("background-color: transparent !important");
  const originalStyles = html.indexOf("css/style.css");
  assert.ok(preparedBackground > html.indexOf("<head>"));
  assert.ok(preparedBackground < originalStyles);
  assert.match(html, /body > :not\(:has\(> canvas#canvas\)\) \{ opacity: 0 !important; pointer-events: none !important; \}/);
  assert.match(html, /<filter id="crm-dala-black-key"/);
  assert.match(html, /#canvas \{ filter: url\(#crm-dala-black-key\) !important; \}/);
});
