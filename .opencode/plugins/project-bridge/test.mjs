import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "opencode-project-bridge-test-"))
process.env.LOCALAPPDATA = temporary

try {
  const source = new URL("./index.js", import.meta.url)
  const hermesSource = new URL("../../../../Hermes/.opencode/plugins/project-bridge/index.js", import.meta.url)
  assert.equal(await fs.readFile(source, "utf8"), await fs.readFile(hermesSource, "utf8"))
  const undercode = (await import(source)).default
  const hermes = (await import(hermesSource)).default

  async function toolsFor(plugin, directory) {
    const tools = new Map()
    const commands = new Map()
    const synthetic = []
    await plugin.setup({
      app: { version: "2.1.4" },
      location: { directory },
      tool: { transform: async (register) => register({ namespace: () => {}, add: (tool) => tools.set(`project_bridge_${tool.name}`, tool) }) },
      command: { transform: async (register) => register({ add: (command) => commands.set(command.name, command) }) },
      session: { synthetic: async (message) => synthetic.push(message) },
    })
    assert.deepEqual([...tools.keys()].sort(), ["project_bridge_ack", "project_bridge_list", "project_bridge_read", "project_bridge_send"])
    assert(commands.has("buzon-proyectos"))
    return {
      tool: async (name, input) => JSON.parse((await tools.get(`project_bridge_${name}`).execute(input)).content),
      command: async (name, prompt = "") => commands.get(name).execute({ sessionID: "test", prompt: { text: prompt } }),
      synthetic,
    }
  }

  const undercodeClient = await toolsFor(undercode, "D:/Documentos/undercodeec_nextjs")
  const hermesClient = await toolsFor(hermes, "D:/Documentos/Hermes")
  const fromUnderCode = undercodeClient.tool
  const fromHermes = hermesClient.tool
  assert.deepEqual(await fromHermes("list", {}), [])

  const sent = await fromUnderCode("send", { taskId: "CRM-101", subject: "Contrato Inbox", body: "Validar orden de mensajes y pruebas." })
  assert.equal(sent.to, "hermes")
  assert.match(sent.source.head, /^[0-9a-f]{40}$/)
  const inbox = await fromHermes("list", {})
  assert.equal(inbox.length, 1)
  assert.equal(inbox[0].id, sent.id)
  assert.equal(inbox[0].acknowledged, false)
  const message = await fromHermes("read", { id: sent.id })
  assert.equal(message.body, "Validar orden de mensajes y pruebas.")
  assert.equal(message.from, "undercode")
  assert.deepEqual(await fromHermes("ack", { id: sent.id, note: "Recibido" }), { id: sent.id, acknowledged: true })
  assert.deepEqual(await fromHermes("list", {}), [])
  assert.equal((await fromUnderCode("list", { mailbox: "outbox" }))[0].acknowledged, true)

  const reply = await fromHermes("send", { taskId: "CRM-101", subject: "Respuesta Inbox", body: "Contrato revisado." })
  assert.equal((await fromUnderCode("read", { id: reply.id })).body, "Contrato revisado.")
  await assert.rejects(() => fromUnderCode("read", { id: sent.id }))
  await assert.rejects(() => fromUnderCode("send", { taskId: "../escape", subject: "X", body: "Y" }))
  await assert.rejects(() => fromHermes("ack", { id: "../../otro" }))
  await undercodeClient.command("enviar-hermes", "CRM-102 | Slash command | Probado desde comando.")
  await hermesClient.command("buzon-proyectos")
  assert.match(hermesClient.synthetic.at(-1).text, /CRM-102/)
  await hermesClient.command("enviar-undercode", "CRM-102 | Respuesta | Recibido.")
  await undercodeClient.command("buzon-proyectos")
  assert.match(undercodeClient.synthetic.at(-1).text, /Respuesta/)
  await assert.rejects(() => undercodeClient.command("enviar-hermes", "formato inválido"))
  console.log("Project Bridge: envío bidireccional, lectura, confirmación y límites OK")
} finally {
  const resolved = await fs.realpath(temporary)
  if (!resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(resolved).startsWith("opencode-project-bridge-test-")) {
    throw new Error("Ruta temporal inesperada; se conservó para revisión")
  }
  await fs.rm(resolved, { recursive: true, force: true })
}
