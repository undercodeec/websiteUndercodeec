import fs from "node:fs"
import { execFileSync } from "node:child_process"
import path from "node:path"

const MAIN = "D:/Documentos/undercodeec_nextjs"
const HERMES = "D:/Documentos/Hermes"
const BACKEND = `${HERMES}/hermes-backend`
const WEB = `${HERMES}/Hermes-web`
const childRoot = new Map()
const norm = (value) => path.win32.normalize(value).replaceAll("\\", "/").replace(/\/$/, "").toLowerCase()
const inside = (value, root) => norm(value) === norm(root) || norm(value).startsWith(`${norm(root)}/`)
const rule = (action, resource, effect) => ({ action, resource, effect })
const protectedPath = (value) => /(?:^|\/)\.git(?:\/|$)/.test(norm(value))

function gitRoot(dir) {
  return execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8", windowsHide: true }).trim()
}

function verify() {
  for (const [expected, actual] of [[MAIN, MAIN], [HERMES, HERMES], [WEB, WEB]]) {
    if (norm(fs.realpathSync.native(expected)) !== norm(expected)) throw new Error(`Ruta canónica inesperada: ${expected}`)
    if (norm(gitRoot(actual)) !== norm(expected)) throw new Error(`Raíz Git inesperada: ${expected}`)
  }
  if (norm(fs.realpathSync.native(BACKEND)) !== norm(BACKEND)) throw new Error("Hermes Backend no es ruta canónica")
  if (!inside(BACKEND, HERMES) || inside(BACKEND, WEB)) throw new Error("Límites de repositorio inválidos")
}

function grantRules(flags) {
  if (!flags.backend && !flags.web) return []
  return [
    ...(flags.backend ? [rule("undercode_link_backend", "*", "allow")] : []),
    ...(flags.web ? [rule("undercode_link_web", "*", "allow")] : []),
    rule("edit", `${MAIN}/*`, "allow"),
    rule("external_directory", `${HERMES}/*`, "allow"),
    rule("read", `${HERMES}/*`, "deny"),
    rule("edit", `${HERMES}/*`, "deny"),
    ...(flags.backend ? [rule("read", `${BACKEND}/*`, "allow"), rule("edit", `${BACKEND}/*`, "allow")] : []),
    ...(flags.web ? [rule("read", `${WEB}/*`, "allow"), rule("edit", `${WEB}/*`, "allow")] : []),
    rule("edit", `${BACKEND}/.git/*`, "deny"),
    rule("edit", `${WEB}/.git/*`, "deny"),
    rule("edit", `${MAIN}/.git/*`, "deny"),
    rule("shell", "*", "allow"),
    ...["git push --force*", "git push -f *", "git push * --force*", "git push * -f *", "git push --mirror*", "git push *+*", "*prisma migrate deploy*", "kubectl *", "pm2 *"].map((pattern) => rule("shell", pattern, "deny")),
  ]
}

export default {
  id: "undercode.temporary-hermes",
  async setup(ctx) {
    if (ctx.app.version !== "2.1.4") throw new Error("Plugin temporal requiere OpenCode 2.1.4")
    verify()

    async function rootOf(sessionID) {
      if (childRoot.has(sessionID)) return childRoot.get(sessionID)
      let current = sessionID
      const visited = new Set()
      while (current && !visited.has(current)) {
        visited.add(current)
        const session = await ctx.session.get({ sessionID: current })
        if (!session?.parentID) break
        current = session.parentID
      }
      childRoot.set(sessionID, current)
      return current
    }

    async function links(sessionID) {
      const root = await rootOf(sessionID)
      const session = await ctx.session.get({ sessionID: root })
      const permissions = session?.permissions || []
      const marked = (action) => permissions.some((entry) => entry.action === action && entry.effect === "allow")
      return { backend: marked("undercode_link_backend") || marked("undercode_link_active"), web: marked("undercode_link_web") }
    }

    const knownRules = [
      ...grantRules({ backend: true, web: true }),
      rule("external_directory", `${WEB}/*`, "deny"),
      rule("read", `${WEB}/*`, "deny"),
      rule("edit", `${WEB}/*`, "deny"),
    ]
    const isLinkRule = (entry) => ["undercode_link_expires", "undercode_link_active"].includes(entry.action) || knownRules.some((rule) => rule.action === entry.action && rule.resource === entry.resource && rule.effect === entry.effect)

    async function updateFamily(root, target, linked) {
      const flags = await links(root)
      flags[target] = linked
      const pending = [root]
      while (pending.length) {
        const sessionID = pending.shift()
        const current = await ctx.session.get({ sessionID })
        const original = (current.permissions || []).filter((entry) => !isLinkRule(entry))
        const permissions = [...original, ...grantRules(flags)]
        await ctx.session.update({ sessionID, permissions })
        let cursor
        do {
          const page = await ctx.session.list({ parentID: sessionID, limit: 100, ...(cursor ? { cursor } : {}) })
          for (const child of page.data) pending.push(child.id)
          cursor = page.cursor.next
        } while (cursor)
      }
    }

    await ctx.permission.hook("evaluate", async (event) => {
      if (!["external_directory", "read", "edit"].includes(event.action)) return
      if (!event.resources.some((p) => inside(p, HERMES))) return
      const flags = await links(event.sessionID)
      const allowed = (p) => (flags.backend && inside(p, BACKEND)) || (flags.web && inside(p, WEB))
      if (event.action === "external_directory") {
        if (event.resources.some((p) => !inside(p, HERMES) || (norm(p) !== norm(HERMES) && !allowed(p))) || (!flags.backend && !flags.web)) {
          event.effect = "deny"
        } else {
          event.effect = "allow"
        }
        return
      }
      if (event.resources.some((p) => !allowed(p) || protectedPath(p))) {
        event.effect = "deny"
        return
      }
      event.effect = "allow"
    })

    await ctx.command.transform((editor) => {
      editor.add({
        name: "vincular-hermes",
        description: "Vincula Hermes Backend para trabajo autónomo en esta sesión",
        execute: async ({ sessionID }) => {
          verify()
          const session = await ctx.session.get({ sessionID })
          if (session.parentID) throw new Error("Vincule Hermes desde la sesión principal")
          await updateFamily(sessionID, "backend", true)
          await ctx.session.synthetic({ sessionID, text: "Hermes Backend vinculado hasta /desvincular-hermes. Los agentes de esta sesión pueden editar y ejecutar shell para desarrollar, probar con Docker/PostgreSQL, revisar, hacer commit y push en ramas de desarrollo de UnderCodeEC y Hermes Backend. Hermes Web y producción siguen excluidos." })
        },
      })
      editor.add({
        name: "desvincular-hermes",
        description: "Revoca el acceso a Hermes Backend sin cerrar OpenCode",
        execute: async ({ sessionID }) => {
          const root = await rootOf(sessionID)
          await updateFamily(root, "backend", false)
          await ctx.session.synthetic({ sessionID, text: "Hermes Backend desvinculado. Los subagentes ya creados quedan bloqueados por el control del plugin." })
        },
      })
      editor.add({
        name: "vincular-hermes-web",
        description: "Vincula Hermes Web para trabajo autónomo en esta sesión",
        execute: async ({ sessionID }) => {
          verify()
          const session = await ctx.session.get({ sessionID })
          if (session.parentID) throw new Error("Vincule Hermes Web desde la sesión principal")
          await updateFamily(sessionID, "web", true)
          await ctx.session.synthetic({ sessionID, text: "Hermes Web vinculado hasta /desvincular-hermes-web. Los agentes de esta sesión pueden desarrollar, validar, hacer commit y push en ramas de desarrollo de UnderCodeEC y Hermes Web. Hermes Backend requiere /vincular-hermes por separado. No despliegues a producción." })
        },
      })
      editor.add({
        name: "desvincular-hermes-web",
        description: "Revoca el acceso a Hermes Web sin afectar Hermes Backend",
        execute: async ({ sessionID }) => {
          const root = await rootOf(sessionID)
          await updateFamily(root, "web", false)
          await ctx.session.synthetic({ sessionID, text: "Hermes Web desvinculado. Hermes Backend conserva su estado independiente." })
        },
      })
    })
  },
}
