import assert from "node:assert/strict"
import plugin from "./index.js"

function harness() {
  const commands = new Map()
  const sessions = new Map([
    ["main", { id: "main" }],
    ["fresh", { id: "fresh" }],
  ])
  const updates = []
  let evaluate
  const ctx = {
    app: { version: "2.1.4" },
    permission: {
      hook: async (_name, callback) => { evaluate = callback },
    },
    command: { transform: async (callback) => callback({ add: (command) => commands.set(command.name, command) }) },
    session: {
      get: async ({ sessionID }) => sessions.get(sessionID),
      list: async ({ parentID }) => ({ data: [...sessions.values()].filter((session) => session.parentID === parentID), cursor: { next: null } }),
      update: async (input) => { updates.push(input); sessions.get(input.sessionID).permissions = input.permissions },
      synthetic: async () => {},
    },
  }
  return { ctx, commands, updates, addChild: () => sessions.set("child", { id: "child", parentID: "main" }), check: (event) => evaluate(event) }
}

const h = harness()
await plugin.setup(h.ctx)
const event = (sessionID, agent, action, resource) => ({ sessionID, agent, action, resources: [resource], effect: "allow" })
const deniedEvent = (sessionID, agent, action, resource) => ({ ...event(sessionID, agent, action, resource), effect: "deny" })
const backend = "D:/Documentos/Hermes/hermes-backend/src/example.ts"
const web = "D:/Documentos/Hermes/Hermes-web/example.ts"
const main = "D:/Documentos/undercodeec_nextjs/src/example.ts"
const before = event("main", "hermes-backend", "edit", backend)
await h.check(before)
assert.equal(before.effect, "deny")
h.addChild() // El especialista puede existir antes de vincular Hermes.
await h.commands.get("vincular-hermes").execute({ sessionID: "main" })
assert.deepEqual(h.updates.slice(-2).map((update) => update.sessionID), ["main", "child"])
assert(h.updates.at(-1).permissions.some((r) => r.action === "edit" && r.resource.endsWith("hermes-backend/*") && r.effect === "allow"))
assert(h.updates.at(-1).permissions.some((r) => r.action === "shell" && r.resource === "*" && r.effect === "allow"))
for (const [sessionID, agent, action, resource, expected] of [
  ["main", "undercode-coordinator", "read", backend, "allow"],
  ["child", "hermes-backend", "edit", backend, "allow"],
  ["child", "undercode-crm", "edit", backend, "allow"],
  ["child", "undercode-qa", "edit", backend, "allow"],
  ["child", "hermes-backend", "edit", web, "deny"],
  ["child", "hermes-backend", "edit", `${backend}/../../../Hermes-web/example.ts`, "deny"],
  ["child", "hermes-backend", "edit", "D:/Documentos/Hermes/hermes-backend/.env", "allow"],
  ["child", "hermes-backend", "edit", "D:/Documentos/Hermes/hermes-backend/.opencode/agents/hermes-backend.md", "allow"],
  ["child", "hermes-backend", "edit", "D:/Documentos/Hermes/hermes-backend/AGENTS.md", "allow"],
  ["child", "hermes-backend", "edit", "D:/Documentos/Hermes/hermes-backend/test/schema.sql", "allow"],
  ["child", "hermes-backend", "edit", "D:/Documentos/Hermes/hermes-backend/.git/config", "deny"],
  ["fresh", "hermes-backend", "read", backend, "deny"],
  ["main", "undercode-coordinator", "read", main, "allow"],
]) {
  const e = event(sessionID, agent, action, resource)
  await h.check(e)
  assert.equal(e.effect, expected, `${sessionID} ${agent} ${action} ${resource}`)
}
const inheritedDeny = deniedEvent("child", "hermes-backend", "edit", backend)
await h.check(inheritedDeny)
assert.equal(inheritedDeny.effect, "allow")
const externalDeny = deniedEvent("child", "hermes-backend", "external_directory", "D:/Documentos/Hermes/hermes-backend/test")
await h.check(externalDeny)
assert.equal(externalDeny.effect, "allow")
await plugin.setup(h.ctx) // Una recarga del plugin debe conservar el permiso temporal de esta sesión.
const afterReload = deniedEvent("child", "hermes-backend", "edit", backend)
await h.check(afterReload)
assert.equal(afterReload.effect, "allow")
await h.commands.get("desvincular-hermes").execute({ sessionID: "main" })
assert.deepEqual(h.updates.slice(-2), [{ sessionID: "main", permissions: [] }, { sessionID: "child", permissions: [] }])
const revoked = event("child", "hermes-backend", "read", backend)
await h.check(revoked)
assert.equal(revoked.effect, "deny")
const restarted = harness()
await plugin.setup(restarted.ctx)
const resumed = event("main", "hermes-backend", "read", backend)
await restarted.check(resumed)
assert.equal(resumed.effect, "deny")
console.log("Comprobaciones simuladas de permisos: OK")
