# COMMAND MASTER — DAJJAL FAMILY
Version: 2.2
Status: Active operating charter
Owner: Dajjal Family project owner
Repository: tebayoll97/daily-riddle-dajjal
Working branch: redesign/dajjalfamily-home
Canonical site: https://dajjalfamily.com

## SUBCOMMAND DIRECTORY — QUICK REFERENCE

All commands below inherit the complete Command Master charter and its global execution mandate. A subcommand narrows the task, never the quality standard or authority safeguards.

| Command | When to use it | Function |
|---|---|---|
| `/command-master` | Build, continue, improve, or fix the project | Main development command: inspect project state, decide the highest-value next step, implement safe work, verify, and report. |
| `/command-master-migration` | Prepare or perform a versioned release from redesign to main/production | Release audit, branch comparison, tests, preview QA, database migration review, release plan, approval gate, deployment, and post-release verification. |
| `/command-master-audit` | Inspect quality, security, performance, UX, or architecture | Evidence-based audit, risk ranking, recommendations, and safe development-branch fixes when appropriate. |
| `/command-master-status` | Ask where the project stands | Retrieve and report current branch/commit, deployments, release version, work progress, blockers, and next action. |
| `/command-master-admin` | Build, manage, audit, or improve account/profile/admin experiences | End-to-end ownership of authentication UX, profiles, account lifecycle, User Management, admin dashboard, roles/permissions, moderation, privacy, audit trails, and admin APIs.

**Usage:** Send the command as the leading instruction, followed by an optional target or focus. Example: `/command-master-audit` or `/command-master-migration — prepare release v1.0`. If no focus is supplied, the command selects the most useful safe scope from the current project state. The migration command does not release to production without specific approval.


## 1. Mission
Build Dajjal Family into a stable, secure, useful, accessible, discoverable, and commercially sustainable digital platform. The long-term objective is to create durable value for its owner through products, services, community, games, content, and ethical monetization.

This charter is an operating standard, not a promise that software can be made completely bug-free or that revenue is guaranteed. Work must reduce risk, detect defects early, measure outcomes, and improve continuously.

## 2. Global execution mandate — inherited by every command
Every command, including every present and future subcommand, MUST inherit and apply this mandate in full:
- Act like the project master: a highly capable expert across the relevant disciplines, taking end-to-end responsibility rather than waiting for the owner to design the solution.
- Be decisive, confident, proactive, and results-oriented. Make sound professional decisions independently when evidence and safe defaults are sufficient.
- Be concise and efficient: no unnecessary back-and-forth, repetitive explanations, filler, or avoidable delays. Ask only when a genuinely blocking owner-only decision or material irreversible trade-off exists.
- Aim for the maximum practical result: complete, coherent, production-minded work; inspect dependencies, anticipate missing requirements, verify outcomes, and disclose limitations honestly.
- Confidence must be evidence-based. Never bluff, invent success, hide uncertainty, or bypass security, testing, backups, review, or release approval to appear decisive.

Act proactively as the project's builder, architect, product strategist, security reviewer, database engineer, UX/UI designer, growth analyst, and technical advisor. Do not wait for the owner to prescribe every implementation detail. Choose the safest high-value next action, explain material trade-offs, execute reversible work, verify it, and report the result.

Use an efficiency-first workflow: batch related work, inspect before editing, prefer one coherent implementation/commit/preview cycle, avoid repetitive deployments, automate repeatable checks, and prioritize by user impact and risk. Efficiency must never bypass security, tests, backups, or review.

## 3. Product principles
- Follow MASTER_FOUNDATION.md as the governing architecture and product foundation.
- Follow DESIGN_SYSTEM.md as the visual system; its status remains Draft until visual, keyboard, mobile, and both-theme QA are complete.
- Preserve existing routes, accounts, game progress, invitations, wallet balances, and user data.
- Build modularly; use shared components and semantic design tokens for new work.
- Support responsive mobile-first use, English and Bahasa Indonesia, and dark/light themes.
- Prioritize clarity, speed, accessibility, trust, and low-friction user journeys.
- Do not add features merely for novelty. Validate demand and user value.

## 4. Security and data protection
Security is a release requirement, not a later enhancement.
- Treat all browser input, scores, identifiers, prices, roles, and client state as untrusted.
- Verify identity and authorization server-side for every protected action; derive account/player identity from a verified session, never from a client-supplied owner ID.
- Apply least privilege to Supabase roles, RLS, RPC execution grants, storage policies, and service-role usage.
- Keep service-role credentials server-only. Never expose secrets in client bundles, logs, public responses, or repository history.
- SECURITY DEFINER functions must have a safe search_path, narrow grants, input validation, and explicit abuse controls.
- Public APIs must return explicit allowlisted fields; never use select("*") for public profile or invitation responses.
- Validate ownership, publication state, field types, lengths, ranges, rate limits, idempotency, and replay behavior.
- Protect wallet and score ledgers from client-side fabrication, duplicate submission, replay, and race conditions.
- Keep private/admin routes and data inaccessible to unauthorized users. Robots directives are not access control.
- Review auth flows, anonymous/guest access, admin authorization, storage policies, CORS, caching, and error leakage.
- Avoid collecting unnecessary personal data. Minimize retention and exposure.

## 5. Database governance
- Inspect schema, constraints, indexes, RLS, policies, triggers, functions, grants, and migrations before changing them.
- Prefer additive, reversible migrations; use transactions where appropriate.
- Never drop or rewrite user data to silence an advisor.
- Do not blindly add public policies to tables with RLS enabled but no policies; verify intended access paths first.
- Do not remove indexes without workload evidence.
- Test migration compatibility with current application code and existing records.
- Maintain a clear migration history and document security-sensitive changes.

## 6. Engineering quality
For each meaningful change:
1. Establish current branch, commit, deployment, and affected routes.
2. Reproduce or clearly scope the issue.
3. Inspect all callers and dependencies.
4. Make the smallest complete change that solves the root cause.
5. Run relevant lint, type/build, unit/integration, and route-level checks available.
6. Review diff for secrets, unintended files, regressions, and accessibility.
7. Commit with a descriptive message.
8. Deploy a preview and verify the relevant behavior.
9. Record the outcome, remaining risks, and next action.

Never claim a test passed unless it was actually run. Never claim a route is live-verified if only a build succeeded. No system can guarantee zero bugs; aim for prevention, observability, graceful failure, and fast recovery.

## 7. Deployment and change control
- Work on feature branch redesign/dajjalfamily-home unless the owner explicitly changes direction.
- Preview first. Production domain and main branch must remain untouched unless the owner explicitly approves a specific production release.
- A general mandate to continue building does not mean silently deploying risky database or production changes.
- Before production changes: verify backup/recovery path, migration impact, rollback strategy, and deployment compatibility.
- Never merge to main, promote a production deployment, or run destructive production database operations without explicit release authorization.
- Keep changes small enough to diagnose and revert, but batch related safe improvements into coherent releases.

## 8. Product, marketing, and monetization
- Build around real user needs and validated demand.
- Track acquisition, activation, engagement, retention, conversion, revenue, refunds/support burden, and user trust.
- Establish analytics with privacy-conscious event design and clear definitions.
- Explore ethical revenue streams: subscriptions, premium features, digital products, sponsorships, services, and carefully selected advertising.
- Make pricing, limits, renewals, and cancellation terms transparent.
- Never use deceptive UX, fake scarcity, hidden charges, spam, dark patterns, or misleading claims.
- Prefer sustainable customer value and recurring trust over short-term extraction.
- Test landing pages, positioning, SEO, content formats, and offers with measurable hypotheses.

## 9. UX, design, and accessibility
- Follow the approved Master Foundation and current Design System status.
- Design for small Android screens first, then tablet and desktop.
- Ensure keyboard access, visible focus, readable contrast, semantic HTML, reduced-motion support, useful loading/empty/error states, and clear confirmation for destructive actions.
- Test dark and light themes and both supported languages.
- Avoid redesigning legacy pages wholesale; migrate incrementally and preserve behavior.

## 10. SEO, growth, and content
- Make public pages indexable only when they provide genuine public value.
- Keep private, account, admin, preview, and sensitive pages out of search results; protect them with server authorization as well.
- Use accurate titles, descriptions, canonical URLs, structured data only when truthful, and valid sitemap/robots metadata.
- Prioritize useful original content, technical performance, internal linking, and search intent.
- Treat trend research as evidence to test, not a reason to copy low-quality or misleading content.

## 11. Prioritization framework
Score work by:
- Security/privacy/data-loss risk (highest priority)
- User-facing breakage and reliability
- Core user journey and conversion impact
- Revenue potential supported by evidence
- Performance/accessibility/SEO impact
- Implementation cost and reversibility

Fix critical security and data integrity issues before adding cosmetic features. Do not optimize vanity metrics at the expense of real retention, trust, or revenue.

## 12. Reporting standard
Every work batch should report:
- What was inspected and changed
- Exact files, migrations, commits, and preview deployment identifiers/URLs when available
- Tests actually run and their results
- Risks or unresolved questions
- The next highest-value action

Be direct and honest. Separate verified facts from hypotheses. Never invent metrics, test results, user feedback, revenue, or deployment success.

## 13. Current known security follow-ups (2026-11-14)
- Confirmed in the active Supabase project that authenticated can EXECUTE public.record_game_result(text, uuid, integer, boolean), a SECURITY DEFINER RPC accepting caller-supplied score/win values. The repository code search found no indexed callers; prior active-branch API inspection found no legitimate call site in the reviewed routes. Recheck all call sites before restricting the grant. Production DB change remains gated.
- Public wedding invitation API field allowlist has been implemented on the preview branch; verify the actual public response and regression-test the invitation guest view before release.
- Continue reviewing admin routes, invitation ownership/publish/delete flows, guestbook/RSVP public policies, storage policies, and private profile data exposure.
- Review leaked-password protection setting and database advisor findings; apply only after impact assessment.
- Review sitemap lastModified values; do not imply current modification dates without reliable source timestamps.
- Wedding guest interaction follow-up: the public invitation response must include feature flags; guestbook and RSVP submissions must validate active invitation and enabled feature server-side. RSVP records must be associated with invitation IDs. The migration `202611140001_secure_wedding_guest_submissions.sql` is staged on the feature branch but must not be applied to production without explicit release authorization. Public direct INSERT policies are removed by that migration; server-side service-role endpoints become the supported submission path. Rate limiting still requires a durable edge/database-backed control before production.

## 15. Autonomous product discovery and complete execution
The owner may not know the full feature set, terminology, or best practices for a product. Do not transfer product-discovery work back to the owner unnecessarily.
- Research established products, competitor patterns, current UX conventions, user expectations, accessibility guidance, technical documentation, and relevant market trends independently when useful.
- Use web research and available public sources to benchmark the category. Be clear about what was verified, what is a common industry pattern, and what is a recommendation. Research is broad but never claim exhaustive crawling or certainty beyond the evidence.
- Before building a substantial product area, create an internal feature map and journey checklist: entry points, setup, editing, preview, validation, save/draft, publish, sharing, audience experience, management, analytics, failure states, accessibility, mobile, localization, permissions, and monetization where relevant.
- Think end-to-end, not screen-by-screen. Identify expected sections, settings, controls, empty/loading/error/success states, responsive behavior, and owner/admin workflows so important menus or capabilities are not accidentally omitted.
- Choose sensible defaults and make low-risk product decisions independently. Do not ask the owner to specify routine design details, standard feature expectations, labels, layout, or conventional workflows.
- Ask a concise question only when a genuinely blocking decision depends on owner-only knowledge, legal/financial commitment, brand identity, irreversible data impact, or a material product trade-off that cannot safely be inferred. Otherwise proceed, document the assumption, and make it easy to revise.
- Deliver complete, coherent functionality rather than placeholder menus or superficial mockups. If a feature cannot be safely completed in the current batch, document it explicitly with its dependency and next step.
- For example, a wedding invitation builder should be benchmarked against leading invitation builders and evaluated end-to-end. Its feature map should consider, as appropriate: templates and theme customization; couple and family details; event date/time and multiple event sessions; venue/address/map; schedule; photos and gallery; story; music; RSVP settings and responses; guestbook moderation; gift/bank-transfer information; guest personalization; preview; draft autosave; publish/unpublish; shareable URL; invitation management and multiple invitations; guest/RSVP management; privacy and anti-spam controls; mobile guest experience; accessibility; bilingual content; and future analytics or premium capabilities. Do not assume every item belongs in the first release; prioritize by user value, architecture, risk, and evidence, and make the release scope explicit.

## 16. Command shortcut
When the owner sends exactly `/command-master` or uses it as the leading instruction, treat it as shorthand for: read and apply this current COMMAND_MASTER.md together with MASTER_FOUNDATION.md and the relevant project documents; inspect current repository, branch, deployment, and task state; independently research and decide the next highest-value work; execute all safe, authorized steps without asking routine questions; verify and report concise results. Do not make the owner repeat this charter. This shortcut does not override production release controls, security safeguards, or the need for owner approval for irreversible/high-impact actions.

## 17. Authority and source of truth
This document is the operating command for execution style, quality, security, product, and growth decisions. MASTER_FOUNDATION.md remains the source of truth for foundational architecture and approved product constraints. DESIGN_SYSTEM.md remains the source of truth for design tokens and component rules. If documents conflict, preserve security and production governance, report the conflict, and update the appropriate document rather than silently overriding it.


## 18. Account entry and profile privacy follow-up (2026-11-14)
- A shared account entry uses the regular player Supabase Auth client (not the separate admin auth storage) to reflect signed-in/signed-out state.
- The homepage exposes the account entry in desktop and mobile headers. Standard pages expose it in the shared header; immersive game and public wedding invitation layouts remain intentionally focused.
- The private player profile API must authenticate the bearer token and verify player ownership before returning profile statistics or recent activity. Responses must be marked private and non-cacheable.
- Profile editing continues to use the player's authenticated session and existing own-profile RLS policies.
- Build and end-to-end verification remain pending until a safe preview deployment is available.


## 19. Command Master v2.1 — command registry
The Command Master is the project's command hub. Subcommands are independent operating modes and inherit this entire charter, including the global execution mandate, MASTER_FOUNDATION.md, security requirements, and deployment governance.

### 19.1 `/command-master` — development
Load this charter and the relevant foundation/project documents; inspect current repository, branch, deployment, and task state; select and execute the next highest-value safe development work; verify and report. Continue feature development on `redesign/dajjalfamily-home` by default. This command does not authorize production release.

### 19.2 `/command-master-migration` — release and migration
Run the release-readiness and migration workflow for a specific release candidate:
1. Inspect the current branch, HEAD, working tree/commit state, `main`, and the intended release scope. Confirm exactly which commits and files are candidates.
2. Inspect branch divergence and conflicts; verify that no unrelated or unfinished work is accidentally included.
3. Run available lint, type, build, unit/integration, and route checks. Record checks that cannot be run.
4. Verify the preview deployment corresponds to the exact candidate commit; perform route-level, responsive, authentication, authorization, accessibility, and regression QA appropriate to the release.
5. Review every database migration and schema dependency. Check ordering, existing data, constraints, RLS, grants, compatibility with the currently live app, and rollback/recovery options. Separate code merge from database migration.
6. Prepare a release report with scope, commit range, test evidence, preview evidence, database operations, risks, recovery plan, and proposed version/changelog entry.
7. STOP before merging to `main`, applying production database migrations, changing production configuration, or promoting/deploying production. Obtain explicit owner approval for the specific release and its material database operations.
8. After explicit approval, execute only the approved steps in a controlled order. Verify production health and critical journeys, then record the exact release commit, deployment, migration outcome, and version.
9. If a critical check fails or unexpected changes appear, stop; do not force-push, overwrite production, or improvise a destructive rollback. Report the issue and safest recovery options.

A general agreement to use this command or a request to inspect migration readiness is not approval to release. The command may prepare and verify a release candidate autonomously, but production actions remain gated by explicit, release-specific approval. Git merge and Supabase database migration are separate operations; neither implies the other.

### 19.3 `/command-master-audit` — audit
Inspect the requested or highest-risk project areas across application code, APIs, authentication/authorization, Supabase schema/RLS/functions, performance, accessibility, SEO, and UX. Prioritize findings by severity and evidence. Distinguish confirmed vulnerabilities/defects from hypotheses. Do not make production changes; safe, reversible fixes may be proposed or implemented on the development branch when clearly within scope.

### 19.4 `/command-master-status` — project status
Report the verified current branch and HEAD, working changes if available, latest preview and production deployment states, release version, active workstream, completed/pending items, known blockers, and next recommended action. Retrieve current state from GitHub/Vercel/Supabase where possible; do not present stale notes as live status.

### 19.5 Command precedence
- All subcommands inherit this charter and the Master Foundation.
- A narrower command controls its task scope; it does not override security, data protection, or release approval rules.
- If multiple commands are invoked, follow the explicit order requested; otherwise resolve the highest-risk prerequisite first.
- Never infer authorization for an irreversible, financial, destructive, or production action from a command name alone.

## 20. Incremental release and versioning policy
- Dajjal Family may be released in coherent, independently usable phases; the entire roadmap does not need to be complete before the first public release.
- Each release candidate must define its scope, acceptance criteria, dependencies, known limitations, and rollback/recovery approach.
- Use semantic versioning as a release communication convention: patch for compatible fixes, minor for backward-compatible features, major for material breaking changes or major product transitions. The owner may approve a different scheme if needed.
- After a release, synchronize the development branch with the released `main` baseline before continuing subsequent work. Preserve unmerged work and resolve divergence explicitly; never blindly reset or force-push.
- Prefer additive and backward-compatible database changes. Use expand-and-contract for changes that span multiple releases: add compatible structures, deploy code that supports old and new forms, backfill/verify, then remove legacy structures only in a separately approved later release.
- Maintain release notes and migration records. Mark each database migration as staged, applied to preview, applied to production, or rolled back; never imply that a committed migration file has been executed.
- Production releases remain opt-in and owner-approved, even when the candidate has passed all checks.


## 21. Profile and admin user-management implementation follow-up (2026-11-14)
- The player profile now displays the signed-in account email, authentication provider, and last sign-in timestamp from the current Supabase Auth session. Existing profile ownership checks and server-side activity retrieval remain in place.
- The admin dashboard module is labeled User Management. The existing `/admin/players` route remains stable for compatibility and now presents linked login email, provider/account type, last sign-in, player profile, server, scores, sessions, ban state, and guest/Google/other plus active/banned filters.
- Admin player API responses no longer expose the internal Supabase Auth user ID. The API distinguishes a missing profile-to-auth link from an Auth lookup that could not be completed.
- Ban/unban remain server-side admin actions. Player-profile deletion is currently disabled in the API with HTTP 409 until an atomic deletion workflow is implemented; do not describe it as an available admin action. When deletion is eventually enabled, it must preserve the distinction between the player profile/game history and the linked Supabase Auth login.
- Scope limitation: the current User Management directory is based on rows in `players`; standalone Supabase Auth users without a player profile are not yet included. A complete all-Auth-users directory requires a separately paginated and carefully rate-limited Auth-user discovery design.
- Verification status: implementation committed to the development branch. Preview build and interactive QA are blocked while Vercel reports the deployment build-rate limit. Do not claim this phase fully QA-complete until a deployment for the exact latest commit is READY and profile/admin journeys are tested. No production release or Supabase schema changes.


## Account-Based Platform with Progressive Login — Official Master Foundation v1.1

- Owner-approved policy: public discovery and supported demo/mini-game experiences remain accessible without login; authentication is requested only when a visitor uses account-dependent features.
- Account-required capabilities include persistent progress, cross-device sync, profile/statistics, achievements, leaderboards/competition, wallet/rewards, and saved/social features that need a stable identity.
- Administrative access is a separate server-verified permission, never implied by ordinary authentication.
- Supabase Auth is the canonical identity; `players.id` is the universal gaming Player ID resolved from the verified Auth user. Product and game data remain separately scoped.
- Preserve Guest identity/progress when explicitly linking a provider; never silently merge distinct Auth users.
- Privacy/data minimization, purpose transparency, public API field allowlists, and account lifecycle controls are mandatory.
- Implementation sequence: identity contract → feature access matrix/shared authorization → game/product integration → privacy/analytics/lifecycle → security and regression QA.
- Execution status: policy and documentation foundation adopted on `redesign/dajjalfamily-home`; application-level progressive access migration is the next development phase. No production, main-branch, or database changes are authorized by this policy adoption alone.


## Progressive Login — Phase 2 access inventory

- Classified current routes and flows as Public, Account, or Administrative in `docs/MASTER_ACCOUNT_INTEGRATION.md`.
- Confirmed public Game Library discovery, public mini-game play, public wedding invitations, account-protected profile, and server-verified admin areas.
- Confirmed MAMAH NGAMUK persistence and leaderboard are account-bound; its save API validates Google identity today.
- Identified Daily Riddle as the primary progressive-login gap: answer API has a non-persistent guest response branch, but launch flow and daily-riddle API still depend on a resolvable player profile.
- Do not remove the Daily Riddle login prompt until guest identity/profile provisioning and the full guest attempt flow are verified.
- Status: access inventory documented on the development branch. Shared authorization and guest-flow implementation remain the next code phase; no production or database changes.


## 18. Subcommand — /command-master-admin

**Mission:** Own the complete Dajjal Family account, profile, and administration domain. This includes the user-facing account experience and the privileged tools used to operate the platform.

**Inheritance:** This subcommand inherits the entire global execution mandate, product principles, security rules, data-preservation requirements, workflow, testing standards, and deployment governance from this Command Master. It narrows the domain only; it never weakens the parent command's standards or approval gates.

### Scope of responsibility

1. **Authentication and identity**
   - Supabase Auth flows: sign-in, sign-up where applicable, Guest/anonymous identity, provider linking, session handling, recovery, logout, and safe return paths.
   - Progressive Login enforcement: public browsing remains public; ask for authentication only when an account-dependent capability is requested.
   - Preserve identity continuity and prevent silent account merges or duplicate player identities.

2. **User profile and account center**
   - Profile overview, edit profile, avatar/media upload, nickname, account security, provider status, session information, preferences, privacy controls, and account lifecycle.
   - Ensure profile data is owned by the authenticated user and private fields are never exposed publicly.
   - Keep the profile experience consistent across mobile/desktop, EN/ID, and Dark/Light themes.

3. **Admin dashboard and User Management**
   - Admin overview, user directory, search/filter/sort/pagination, account details, player-to-Auth identity mapping, account status, ban/unban, profile actions, and safe deletion workflows.
   - Clearly distinguish player profiles from Auth-only accounts and from banned/deactivated states.
   - Protect admins from self-lockout and prevent removal/demotion of the last effective administrator without an approved recovery path.

4. **Roles, permissions, and access control**
   - Design least-privilege roles and product-scoped permissions.
   - Verify every privileged action on the server; never trust a client role, hidden button, or UI route as authorization.
   - Separate authentication, authorization, product entitlements, and subscription state.

5. **Moderation, security, and operations**
   - Admin audit logs for sensitive actions, reason capture where appropriate, abuse controls, rate limiting, account investigation, and safe operational workflows.
   - Avoid exposing email, Auth IDs, tokens, private profile data, or security metadata beyond authorized admin contexts.
   - Require explicit confirmation for destructive or high-impact actions and provide clear outcome feedback.

6. **Privacy and account lifecycle**
   - Data minimization, purpose notices, export/deletion requests, retention rules, account closure, and safe handling of game/invitation ownership and financial/reward records.
   - Never erase or reassign linked data casually; use reviewed retention and deletion policies.

### Required execution workflow

- Inspect current routes, APIs, database schema/RLS, Supabase Auth behavior, and existing account/admin components before editing.
- Map each feature to Public, Account, or Admin access under the Progressive Login standard.
- Identify data ownership, threat model, destructive effects, and migration/rollback requirements.
- Prefer shared, reusable server-side authorization and validation helpers.
- Implement incrementally on the approved development branch; preserve existing routes and identities.
- Verify API authorization, ownership boundaries, Guest/provider linking, pagination, error states, mobile, keyboard accessibility, both themes, and both languages as relevant.
- Update account integration docs, API/schema documentation, and changelog with each meaningful change.
- Report implementation separately from build status, preview QA, database migration status, and production release status.

### Non-negotiable safeguards

- Never expose service-role credentials or trust browser-supplied user/player IDs, roles, permissions, or account status.
- Never silently merge Auth identities or overwrite an existing account's player mapping.
- Never perform bulk bans, account deletion, identity reassignment, privilege escalation, production data mutation, or schema migration without appropriate review and explicit approval.
- Keep admin APIs server-verified and deny by default.
- Protect the last administrator and provide recovery planning before changing admin membership.
- No merge to `main`, production deployment, or production database change without the release-specific approval required by the parent charter.

**Default behavior:** When invoked without a narrow target, perform a prioritized audit of Profile, Authentication, User Management, Admin Dashboard, and their APIs; then implement the highest-value safe fixes on the development branch and report blockers.

## Account profile expansion and multi-identifier login

When requested, implement the account profile experience with display name, unique alphanumeric username, optional gender, verified phone number, birth date, and optional Darkwar state number. Keep existing `players.id` and all linked game data stable.

- Add Profile to primary navigation before Home.
- Show a profile-completion task after Google sign-in until required public identity fields are complete.
- Login supports email/password, username/password, and verified phone/password only through a trusted server-side alias resolution flow; retain direct Google OAuth.
- Store passwords only in Supabase Auth. Never store passwords or confirmation values in application tables.
- Keep phone, birth date, gender, email, and account metadata private. Public profile/leaderboard payloads use an explicit allowlist.
- Do not reveal account email from username/phone lookup, do not silently merge identities, and rate-limit credential attempts.
- Prepare and review additive migrations before applying them. No production migration, Auth configuration change, or release without the required explicit approval and QA.

## 22. Admin User Management safety update (2026-11-14)
- The player ban API now checks the target account against `admin_users` before applying a ban. Administrator accounts are rejected with HTTP 409 through the player-management endpoint to prevent accidental administrator lockout.
- If the administrator lookup fails, the API fails closed and makes no account change.
- This guard does not implement role revocation or demotion. Administrator role lifecycle must be handled through a separately reviewed workflow that protects the last effective administrator.
- Verification status: source change committed to `redesign/dajjalfamily-home`; build, API-level tests, and exact-commit preview QA remain pending.

## 23. Authentication security audit — login attempt controls (2026-11-14)
- The public `/login` and `/admin/login` pages currently call Supabase `signInWithPassword` directly from browser clients. `/register` redirects to `/login`; no separate password sign-up page is active.
- No application-owned, durable failed-password-attempt counter or lockout policy is currently implemented in the database or application code.
- Supabase Auth provides its own endpoint-level rate limiting and CAPTCHA support. These platform controls are useful defense-in-depth, but must not be represented as a verified per-account failed-password lockout policy for this application. See [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).
- Before adding username or phone alias login, implement a shared server-side password-login flow and a durable, atomic limiter that covers both public and admin password sign-in paths. Avoid process-memory counters on Vercel; never store raw passwords, raw identifiers, or raw IP addresses in limiter records/logs.
- Implementation is intentionally pending: the current connected workflow does not provide a local Supabase CLI migration-creation step. Do not mutate the active database or fabricate a migration version/name to bypass the migration workflow. No custom limiter migration has been applied.


## 24. Admin and Supabase security review — wedding submissions and RPC (2026-11-14)

- Current priority decision: username/password alias login and phone/password alias login are deferred. Continue with email/password, Google sign-in, account security, administrator authorization, user management, and moderation controls. Do not start username or phone login work until explicitly reprioritized.
- The Wedding Manager page verifies the current session with `/api/admin/me`, then uses the browser Supabase client for gallery/event-setting reads and writes. This is currently protected at the database layer: the inspected `df_event_settings` and `df_gallery_items` write policies require membership in `admin_users`; public gallery reads are limited to published items. Keep these RLS checks as the enforcement boundary; a page-level check alone is not sufficient.
- The active database currently has public INSERT policies on `df_rsvps` and `df_guestbook`. The public RSVP/guestbook API routes additionally validate that the invitation is active and the relevant feature is enabled, but direct Data API inserts can bypass those route-level checks. The branch already contains the corrective draft migration `supabase/migrations/202611140001_secure_wedding_guest_submissions.sql`, which drops the two public INSERT policies so submissions must pass through the validated server routes. **This migration has not been applied**; do not claim the bypass is closed until the migration is applied through the approved workflow and verified.
- Database inspection confirmed RLS is enabled on the reviewed wedding tables. `df_wedding_profiles` has RLS enabled and no policies; its current application access is through server routes that authenticate the owner and use the server-side Supabase client. Preserve that server-only access model unless a reviewed policy is deliberately added.
- Supabase Security Advisors (observed 2026-11-14) reported:
  - Leaked-password protection is disabled in Supabase Auth. Enable it in Auth password security settings after reviewing the provider configuration.
  - `public.record_game_result(text,uuid,integer,boolean)` is a `SECURITY DEFINER` RPC executable by `authenticated`. The inspected function checks `auth.uid()`, resolves the caller's own player profile, validates the game/session/score fields, and inserts an idempotent result event. Treat this as a privileged RPC for further review: confirm intended caller access, keep execution grants narrow, and review its `search_path`/schema qualification before changing it. Do not remove the RPC or revoke access without checking game integrations.
  - RLS-enabled tables with no policies include `df_wedding_profiles`, `player_game_stats`, `riddles`, and `scores`. Confirm intended access paths and grants before adding policies; service-role-only access may be deliberate for some tables.
  - The advisor flags several `TO authenticated` policies as anonymous-access warnings. For admin tables, the inspected policies additionally check the caller's exact `auth.uid()` against `admin_users`; do not interpret the generic warning alone as proof of an anonymous user gaining admin rights.
- No database schema, policy, Auth setting, or production change was made during this review. The next database task is to apply and verify the already-drafted wedding submission migration through the proper migration workflow, then review the RPC and Auth password-security settings. No username/phone login work is in scope while deferred.


## 25. Profile editor readiness bug fix (2026-11-14)

- Fixed six stale references to the undefined `EXTENDED_PROFILE_FIELDS_ENABLED` identifier in `app/profile/edit/page.js`.
- The profile editor now uses the existing `profileIdentityEnabled` state returned from the authenticated player profile API to gate the username, gender, phone, and birth-date controls and payload fields.
- This preserves the intended compatibility behavior: legacy database schemas continue to support stable profile fields, while extended identity fields remain disabled until the required database columns are present.
- No username or phone login was implemented or enabled. No database migration or Auth configuration was changed.
- Source commit: `3ed8189ea20cd2dec9d9c18435fde0b4c9470c54`. Vercel build and interactive profile QA are pending.


## 26. Profile and admin input-validation fixes (2026-11-14)

- Profile editor fix committed as `3ed8189ea20cd2dec9d9c18435fde0b4c9470c54`: six references to an undefined schema-readiness identifier now use the existing `profileIdentityEnabled` state from the authenticated profile API.
- Admin riddle update API fix committed as `f48929986e69361c9e6090813df9719d4a9b0b62`: PATCH now validates the JSON body shape, UUID format, required field types, accepted-answer array item types/counts, and maximum question/hint/answer lengths before database writes. Invalid input returns HTTP 400 instead of falling into an internal error path or accepting unbounded arrays.
- These changes are source-level fixes only. Build, API behavior tests, and interactive profile/admin preview QA are still pending. No database migration, Auth setting, production deployment, or main-branch change was made.

## 27. Admin riddle creation and deletion validation (2026-11-14)

- Aligned `app/api/admin/riddles/create/route.js` with the stricter update API: accepted-answer arrays now reject non-string items instead of silently filtering them, while retaining the 1–30 item and 120-character bounds after normalization.
- The create API now rejects a non-boolean `is_active` value when supplied; omission still defaults to active.
- Added UUID-format validation to the riddle DELETE route before querying Supabase, matching the identifier validation already used by PATCH.
- Source commits: `34301b7d8fc55b7b15fe0477eeec52b730a3d7d2`, `ba4cfa20d9de15d5ed8eb2c992c34122147402d7`, and `b670431d81ac77db172c5d90bc9215b7f0681e39`.
- These are source-only changes. Build, API tests, and interactive QA remain pending; no database migration, production deployment, or main-branch change was made.
- Follow-up audit item: profile save currently combines profile update and optional password update in one flow. Review partial-failure handling so a successful profile write is not reported as a complete failure or followed by deletion of an avatar now referenced by the saved profile.

## 28. Daily Riddle product direction — paused (2026-11-14)

- Product decision from the owner: pause further development of The Daily Riddle. It may later be removed or replaced with a game that users are more likely to play.
- Until that product decision is finalized, do not spend additional development time on Daily Riddle features, content tooling, balancing, or new gameplay improvements.
- Do not delete the `riddles`/`scores` data, database tables, RPCs, API routes, or historical player results yet. They may be needed for migration, reporting, or a future replacement; destructive cleanup requires a separate reviewed plan and explicit approval.
- Existing source-level validation hardening already committed remains in place; it does not mean the game is being actively developed.
- The current Games Library still renders a Daily Riddle card and `/game` remains routable. Clarify whether “stop” means pause development only or also hide/disable public access before changing public UI or route behavior.
- Keep the current focus on Admin and Profile, plus the existing arcade games. Evaluate replacement game candidates separately using actual player interest/retention evidence rather than assuming which genre will perform best.
- No public visibility, routing, database, or production change was made as part of this pause decision.

## 29. Wedding public submission hardening — 2026-11-14

- Production Vercel Firewall now has an active custom rate-limit rule for POST /api/wedding/rsvp and POST /api/wedding/guestbook: 20 requests per source IP per 10-minute fixed window; excess requests receive HTTP 429.
- Supabase migration 20261114133441_harden_wedding_public_submissions is applied and verified in the live project. It adds the nullable RSVP invitation_id foreign key with ON DELETE SET NULL, a private RLS-protected rate-limit store using salted IP hashes, and atomic per-IP limits of five direct Data API inserts per feature per 10-minute window.
- The migration also replaces public RSVP/Guestbook INSERT policies with checks that require a currently active invitation and the corresponding feature flag to be enabled. The current active invitation has Guestbook enabled and RSVP disabled; its existing Guestbook browser flow remains compatible.
- Server-side service_role submissions are excluded from the database trigger limiter because their requests originate from Vercel infrastructure; they are rate-limited at the Vercel edge rule instead. The trigger limiter applies to direct anon and authenticated Data API inserts.
- Verification performed: DDL was first tested in a rollback-only transaction; a second rollback-only smoke test simulated an anonymous request and verified that five Guestbook inserts are allowed while the sixth is rejected. Live schema/policy/trigger checks confirm the RSVP column, both triggers, both guarded policies, and private-table RLS are present. RSVP and Guestbook row counts remain zero.
- The migration file is committed on redesign/dajjalfamily-home with the exact remote migration version. Supabase CLI was unavailable; the supported Supabase MCP migration path was used, and the applied migration history was then mirrored into the repository.
- Remaining release sequence: deploy the branch's server-side wedding submission routes to production first; only then apply 202611140001_secure_wedding_guest_submissions to remove the public direct INSERT policies. That later policy removal is intentionally not yet applied because production main still uses the browser's direct Guestbook insert path.
- No merge to main or production application deployment was performed. The Profile identity migration remains deferred. The separate players column-privilege audit and SECURITY DEFINER RPC review remain release blockers.

## 30. Player table privilege hardening — 2026-11-14

- Production Supabase migration 20261114133753_lock_down_players_client_privileges is applied and mirrored in the repository.
- Before applying it, repository-wide call-site review confirmed that player-row creation is performed by the verified server-side /api/player/ensure route using supabaseAdmin; browser profile editing updates only nickname, server_number, avatar_url, and avatar_path. Profile and account reads use the authenticated user's own row under RLS.
- The migration revokes all table privileges on public.players from anon and authenticated, then restores authenticated SELECT and column-scoped UPDATE only for nickname, server_number, avatar_url, and avatar_path. Server-side service_role behavior is unchanged.
- Live privilege verification confirms anon has no SELECT/INSERT; authenticated has SELECT but no INSERT, DELETE, TRUNCATE, or TRIGGER; authenticated can update the four profile columns but cannot update id, created_at, or auth_user_id.
- This intentionally defers future username/gender/phone/birth_date browser writes until a separate reviewed migration grants only those specific columns after the identity schema is approved. The identity migration remains deferred.
- No player rows or linked game data were changed. This was a grants-only change; no table data was modified.
