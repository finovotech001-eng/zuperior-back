Zuperior Backend Code Review Report

Summary
- Stack: Node.js (ESM), Express 5, Prisma 6.17, PostgreSQL.
- Scope reviewed: routes, controllers, middleware, services, Prisma schema, server bootstrap.
- Key risks: Incorrect Prisma model accessors, route protection gaps, schema–code mismatches, import path issues, broken startup order, and inconsistent ID usage for MT5 relations.

Critical Issues
- Prisma model accessor casing is wrong across many files
  - Prisma client exposes lowercase model properties. Code uses capitalized (e.g. `prisma.User`) which will be undefined at runtime.
  - Examples:
    - `zuperior-back/src/controllers/auth.controller.js:52`
    - `zuperior-back/src/controllers/auth.controller.js:62`
    - `zuperior-back/src/controllers/auth.controller.js:112`
    - `zuperior-back/src/controllers/user.controller.js:58`
    - `zuperior-back/src/controllers/admin.controller.js:52` (and many others)
    - `zuperior-back/src/controllers/activityLog.controller.js:57` (`ActivityLog` must be `activityLog`)
  - Fix: Replace usages with the correct client properties:
    - `User` → `user`, `KYC` → `kYC`, `MT5Account` → `mT5Account`, `MT5Transaction` → `mT5Transaction`, `Deposit` → `deposit`, `Withdrawal` → `withdrawal`, `ActivityLog` → `activityLog`, `PaymentMethod` → `paymentMethod`, `SystemSetting` → `systemSetting`, `Role` → `role`, `UserRole` → `userRole`.

- ESM import extensions missing (will fail to resolve in Node ESM)
  - Examples:
    - `zuperior-back/src/routes/deposit.routes.js:4` and `:5` import without `.js` extension.
    - `zuperior-back/src/controllers/deposit.controller.js:6` and `:7` import without `.js` extension.
  - Fix: Always include file extensions in ESM imports (e.g., `../controllers/deposit.controller.js`).

- MT5 account relation stored inconsistently in Deposit (referential integrity risk)
  - Schema defines `Deposit.mt5AccountId` referencing `MT5Account.id` (internal UUID), not the MT5 login:
    - `zuperior-back/prisma/schema.prisma:134-136`.
  - Controllers store `mt5AccountId` as the external login (string), which will violate the relation and break joins/queries.
    - `zuperior-back/src/controllers/deposit.controller.js:97` (sets `mt5AccountId: mt5AccountId` where this value is the login)
    - `zuperior-back/src/controllers/manualDeposit.controller.js:108` (same issue)
  - Fix: Use the internal MT5Account UUID when persisting:
    - Look up `const account = await prisma.mT5Account.findFirst({ where: { accountId: login, userId } })` and persist `mt5AccountId: account.id`.
  - Related query bugs caused by the above:
    - `zuperior-back/src/controllers/deposit.controller.js:602` filters `deposit: { mt5AccountId: accountId }` assuming `accountId` is login; should join via the internal `account.id`.

- Unprotected route uses `req.user` → crash/leak risk
  - `zuperior-back/src/routes/deposit.routes.js:15` exposes `GET /deposit/transactions/:accountId` without `protect`. The handler accesses `req.user.id`, causing `Cannot read properties of undefined` and potentially leaking behavior differences.
  - Fix: Add `protect` to this route.

- Admin stats use non-existent models/columns
  - `ManualDeposit` model is referenced but not defined in schema:
    - `zuperior-back/src/controllers/adminStats.controller.js:27, 41, 175, 191`
  - Raw SQL uses `created_at` while schema uses `createdAt`:
    - `zuperior-back/src/controllers/adminStats.controller.js:206-211, 288-293, 352-356, 414-418`
  - Fix: Replace `ManualDeposit` with `deposit` and correct casing; in raw SQL, reference the actual column name (`"createdAt"`) or use Prisma aggregations.

- Startup script order prevents migrations from running
  - `zuperior-back/package.json` uses: `"start": "npx prisma generate && node src/index.js && npx prisma migrate deploy"`.
  - Since `node src/index.js` blocks, `migrate deploy` never runs.
  - Fix: `"start": "prisma generate && prisma migrate deploy && node src/index.js"`.

High Priority
- Duplicate servers and route registration
  - Two bootstraps exist: `zuperior-back/src/index.js` and `zuperior-back/src/app.js`. Only one should start the server. Maintaining both risks drift and duplicate middlewares.
  - Fix: Remove/ignore `app.js` or refactor to a factory imported by `index.js`.

- Excessive new PrismaClient instances
  - Many controllers instantiate `new PrismaClient()` instead of reusing one instance (e.g., `zuperior-back/src/controllers/deposit.controller.js:5`). This can exhaust DB connections.
  - Fix: Export a singleton Prisma client (you already have `zuperior-back/src/services/db.service.js`); import and reuse everywhere.

- Stray Next.js API code inside backend repo
  - `zuperior-back/app/api/mt5/groups/route.ts` is a Next.js route and should not live in the backend project.
  - Fix: Remove or move to the frontend `src/app/api/...` folder.

- Inconsistent access patterns to MT5 models
  - Mixed usage: `prisma.MT5Account` vs `prisma.mT5Account` across files.
  - Fix: Standardize on Prisma client’s canonical property names (`mT5Account`, `mT5Transaction`).

- Admin and user controllers rely on fields not defined in schema
  - Examples: balance/equity on `MT5Account`, relations like `manualDeposits` on `User`.
  - Fix: Align code with schema or extend schema accordingly.

Medium Priority
- CORS and auth inconsistencies
  - Backend exposes public `GET /api/mt5/groups` but the frontend proxy requires Authorization. Standardize expectation.

- Logging verbosity
  - Many controllers print sensitive or verbose details (e.g., transactions, tokens, raw responses). Use a logger with levels and redact sensitive fields.

- Manual form-data detection
  - `zuperior-back/src/controllers/deposit.controller.js:18` checks `req.body._boundary` to detect multipart bodies; not reliable. Let `multer` parse files and read fields from `req.body` consistently.

Low Priority
- HTTP method semantics
  - Using `GET` for state changes (e.g., `admin.controller` ban route) is non-RESTful. Prefer `POST/PUT/PATCH`.

Repeated Root Causes
- Prisma API misuse (capitalized model properties) → runtime `undefined` errors across auth, user, admin, activity logs, transactions.
- Wrong key used for MT5 relations (`login` vs internal UUID) → referential integrity errors, broken joins, and inconsistent queries/updates.
- ESM import paths without `.js` extension → module resolution failures.
- Divergent setup paths (two server entrypoints + duplicative middleware) → inconsistent behavior and drift.

Actionable Fix Plan (ordered)
1) Standardize Prisma usage
   - Replace all capitalized model accessors with correct lowercase ones.
   - Centralize Prisma client import from `src/services/db.service.js`.

2) Fix MT5 relation usage
   - Always persist `Deposit.mt5AccountId` and `Withdrawal.mt5AccountId` using the internal `mT5Account.id`.
   - Update queries that compare against the external login to instead join via the MT5Account relation.

3) Harden routing and imports
   - Add `protect` to `GET /deposit/transactions/:accountId`.
   - Add `.js` extensions to all local ESM imports.
   - Remove `src/app.js` or convert into an `createApp()` factory used by `src/index.js`.

4) Align admin stats to schema
   - Replace `ManualDeposit` with `deposit` and fix raw SQL column names. Prefer Prisma aggregations to avoid case errors.

5) Startup script
   - Change start command order to run migrations before booting the server.

6) Reduce noisy logs and apply structured logging
   - Use a logger (pino/winston), hide secrets/tokens, and gate debug logs by `NODE_ENV`.

Notable File References
- Prisma schema: `zuperior-back/prisma/schema.prisma:129`
- Server entrypoints: `zuperior-back/src/index.js:1`, `zuperior-back/src/app.js:1`
- Deposit routes: `zuperior-back/src/routes/deposit.routes.js:4-5`, `:15`
- Deposit controller (ID misuse): `zuperior-back/src/controllers/deposit.controller.js:97`
- Manual deposit controller (ID misuse): `zuperior-back/src/controllers/manualDeposit.controller.js:108`
- Admin stats (bad model/columns): `zuperior-back/src/controllers/adminStats.controller.js:27`, `:206`
- Auth controller (Prisma misuse): `zuperior-back/src/controllers/auth.controller.js:52`

