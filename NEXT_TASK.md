# VASPTrace — Next Task

## ⚠️ FEATURE FREEZE IN EFFECT

**Feature development is FROZEN for the SIH demo.**

DO NOT add new features, new pages, new dependencies, or change the architecture
unless a **critical bug** is discovered that would cause the demo to fail in front of judges.

A critical bug is defined as:
- A blank/crashed page during the judge demo flow
- An API endpoint returning 500 for demo cases (CASE-001, CASE-002, CASE-003)
- A broken navigation link in the sidebar
- A TypeScript or build error blocking `npm run build`

---

## If a Critical Bug Is Found

1. Fix ONLY the failing component — do not refactor surrounding code
2. Re-run `npm run build` in `frontend/` to confirm the fix compiles
3. Re-run `npx tsc --noEmit` in `backend/` to confirm no TS regressions
4. Update the "Fixed Issues" table in `PROJECT_STATUS.md`

---

## Post-SIH Enhancement Roadmap (Do NOT implement before demo)

### Priority 1 — Real Data
- Set `MONGODB_URI` in `backend/.env` for persistent case storage
- Run `npx ts-node backend/src/scripts/seed.ts` to seed MongoDB
- Integrate Etherscan/Polygonscan APIs for real on-chain data

### Priority 2 — Real Reports
- Add `pdfkit` or `puppeteer` to backend
- Stream PDF bytes from `POST /api/reports/:id`
- Add client-side download trigger in the Reports page

### Priority 3 — Auth Hardening
- Hash passwords with bcrypt
- Connect `/api/auth` to the User Mongoose model
- Add refresh token support

### Priority 4 — Deployment
- Frontend → Vercel (auto-deploys from `frontend/` subfolder)
- Backend → Railway or Render
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`

---

## Current State

**All three phases complete. SIH demo ready.**

- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- Mode: Fallback Demo (synthetic data)
- Build: PASSING
- TypeScript: CLEAN
