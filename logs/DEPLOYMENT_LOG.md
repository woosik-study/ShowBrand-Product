# 🚀 ShowBrand — Deployment Log

> Documents all deployment issues, fixes, and lessons learned.
> Format: `[YYYY-MM-DD] — Title`

---

## [2026-05-05] — Production Deployment Debugging & Resolution

### Context
After making the ShowBrand-Product repo public and rotating the Anthropic API key, the production app stopped working entirely. This log documents all issues encountered and resolved during debugging.

---

### Issue 1: .env.local Accidentally Committed to GitHub 🔴

**Problem:** `.env.local` containing `ANTHROPIC_API_KEY` was tracked by git and pushed to the public repo.

**Fix:**
```bash
git rm --cached .env.local
echo ".env.local" >> .gitignore
git commit -m "fix: remove .env.local from tracking"
git push origin main
```
Then immediately rotated the API key on console.anthropic.com.

**Lesson:** Always add `.env.local` to `.gitignore` before the first commit. Never paste API keys in chat or commit them to version control.

---

### Issue 2: Vercel Deployment Protection Blocking API (HTTP 401) 🔴

**Problem:** All `/api/analyze` calls returned 401 — Vercel Authentication was enabled, blocking all external requests.

**Fix:** Vercel → Project Settings → Deployment Protection → Disabled

**Lesson:** Vercel Deployment Protection silently blocks all external API access. Must be disabled for public-facing APIs.

---

### Issue 3: Wrong Environment Variable Name 🟡

**Problem:** Environment variable was saved as `showbrand` (with empty value) instead of `ANTHROPIC_API_KEY`.

**Fix:** Deleted incorrect variable → Added new one with correct key name `ANTHROPIC_API_KEY` → Redeploy

**Lesson:** Double-check environment variable names in Vercel dashboard. A wrong name causes silent 401 failures that look identical to an invalid API key.

---

### Issue 4: Old Deployment URL Not Reflecting New Environment Variables 🟡

**Problem:** Testing against `k111y6ey2` URL which pointed to an old deployment — new environment variables weren't applied.

**Fix:** Used Current deployment URL from Vercel → Deployments → Current → Visit

**Lesson:** Always test against the Current deployment URL after Redeploy, not old deployment-specific URLs.

---

### Issue 5: app/page.tsx Missing — Homepage 404 🔴

**Problem:** `page.tsx` was in `frontend/` folder. Next.js App Router requires it at `app/page.tsx`.

**Fix:**
```bash
cp frontend/page.tsx app/page.tsx
git add app/page.tsx
git commit -m "fix: move page.tsx to app directory"
git push origin main
```

**Lesson:** Next.js App Router requires pages at `app/page.tsx`. Files in custom subdirectories like `frontend/` are not recognized.

---

### Issue 6: API Route Not Found — /api/analyze Returning 404 🔴

**Problem:** `route.js` was in `backend/` folder. Next.js App Router requires API routes at `app/api/[name]/route.js`.

**Fix:**
```bash
mkdir -p app/api/analyze
cp backend/route.js app/api/analyze/route.js
git add app/api/analyze/route.js
git commit -m "fix: move API route to correct Next.js app directory"
git push origin main
```

**Lesson:** Next.js App Router API routes must be at `app/api/[name]/route.js`. Files in `backend/` or other folders are not recognized as API endpoints.

---

### Final Working State

| Item | Value |
|------|-------|
| Live URL | https://show-brand-product-k111y6ey2-woosik-studys-projects.vercel.app |
| GitHub | https://github.com/woosik-study/ShowBrand-Product |
| API | `/api/analyze` ✅ working |
| API Key | Rotated and secured in Vercel environment variables |

---

### Key Takeaways

1. **Never commit `.env.local`** — add to `.gitignore` immediately on project setup
2. **Vercel Deployment Protection** must be disabled for public API access
3. **Next.js App Router file structure** is strict:
   - Pages → `app/page.tsx`
   - API routes → `app/api/[name]/route.js`
4. **Always test with Current deployment URL** after Redeploy
5. **Rotate API keys immediately** if accidentally exposed — even brief exposure is a risk
