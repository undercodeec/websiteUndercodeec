# CRM web sessions — integration contract (2026-11-18)

This client requires the Hermes web-session implementation described in
`hermes-backend/docs/crm-web-human-sessions-20261118.txt`. Do **not** deploy
the new Hermes backend alone: an older client cannot rotate its five-minute
access tokens. Apply the additive `web_sessions` migration first, then roll
out the matching Hermes backend and this client together without mixed-version
Hermes replicas. Rollback to an older Hermes binary requires new logins.

- UnderCode `GET /api/admin/profile` and `POST /api/admin/activity` return
  `expiresAt` in epoch milliseconds. Only trusted foreground input calls the
  activity endpoint. UnderCode `POST /api/crm/auth/session-proof` requires a
  live `adminAuth` bearer belonging to the configured CRM operator and returns
  a signed, unique-jti, 120-second `hermes-crm` proof; it does not renew idle
  time, accept an email, or authorize other admins.
- Hermes `POST /auth/crm-proof` on an OTP login must return `accessToken`,
  `refreshToken`, `expiresAt` (ISO instant) and `user`. `POST /auth/web/refresh`
  rotates refresh once without extending idle time. `GET /auth/web/session`
  and `POST /auth/web/activity` return a server-side ISO `expiresAt`. This
  client checks both servers before displaying CRM, stores Hermes refresh only
  in tab `sessionStorage`, and requires the smaller of both idle deadlines.
- Re-exchange via `/api/crm/auth/session-proof` is **only** available with an
  existing retained Hermes refresh passed as `existingRefreshToken`; generic
  Hermes 401, revoked refresh, or missing refresh never creates a new Hermes
  session. An explicit new OTP login may create a new session. Refresh is
  serialized per tab. SSE and Inbox attachments use the current short-lived
  bearer; successful rotation reconnects SSE. A request is retried once only
  if a known rotation won or if the web JWT expired during the request and a
  refresh succeeds.
- A Hermes 401 hides CRM without invalidating a valid UnderCode admin token;
  UnderCode admin 401 clears both locally and attempts Hermes logout-refresh.
  Browser offline or admin reset/restart cannot **guarantee** Hermes server
  revocation; immediate cross-system revocation needs a trusted server-to-server
  linkage and a separate design. Until then the UI is fail-closed, not proof
  of universal backend revocation.

Existing seven-day legacy Hermes JWTs (including password `/auth/login`
clients) remain a rollout bypass until a separate migration/revocation plan
is approved. Do not advertise a universal 24-hour policy or mistake builds,
PRs or published images for production deployment.
