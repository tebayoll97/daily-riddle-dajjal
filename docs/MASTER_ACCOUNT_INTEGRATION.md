# Master Account Integration Contract

This project is the central identity provider for Dajjal Family Gaming Universe.

## Identity shared by every game

- Supabase Auth user with a verified Google identity
- `players.id` — the stable universal Player ID
- `players.nickname` — one globally unique nickname
- `players.avatar_url` — the shared player avatar

A game must resolve the current authenticated user to the existing `players` row by `auth_user_id`. It must never create a second player identity for the same user.

Use `getPlayerContext()` from `@/lib/playerAccount` in client components:

```js
import { getPlayerContext } from "@/lib/playerAccount";

const context = await getPlayerContext();

if (context.status === "signed_out") {
  // Ask the player to sign in with Google.
} else if (context.status === "profile_required") {
  // Provision the shared player profile after Google authentication.
} else {
  // context.player.id is the universal Player ID.
  // context.accountType must be "google" for account-based games.
}
```

## Data that must remain game-specific

Every game's economy and progression belongs to that game's own data scope:
- coins / wallet balance
- score and best score
- levels, inventory, upgrades and attributes
- missions, achievements and unlocks
- game-specific settings and progress

Use the universal Player ID together with a game identifier, such as `player_id` and `game_id`, to scope records. Never store all games' coins in one shared balance unless a future product decision explicitly introduces a separate universe-wide currency.

## Non-negotiable safety rules

1. Never use nickname as the account key. Use `players.id`.
2. Never accept a client-supplied Player ID as proof of identity. Resolve the user from the verified Supabase session on the server.
3. Never silently merge a Guest account into an existing Google account.
4. Linking Google to a Guest must use Supabase identity linking so the same Auth user and Player ID are retained.
5. If Google belongs to another existing Auth user, stop and ask the player to sign in to that account; do not reassign or merge data automatically.
6. Keep the public profile endpoint public only for its explicitly selected public fields. Never return `auth_user_id`, email, access tokens, or private account metadata.
7. Do not put service-role credentials in browser code.
8. Keep game wallet and progression isolated by game ID.

## Existing central tables

- `players`: universal player identity and shared profile.
- `games`: registered game catalog and stable game IDs/slugs.
- `player_game_stats`: per-player, per-game aggregate statistics.
- `game_result_events`: per-game result history.

The current shared resolver is an additive foundation. Existing game routes should be migrated to it gradually and tested one at a time; do not perform a broad rewrite of authentication or database policies in one deployment.


## Per-game wallet foundation

The central database now includes:

- `player_game_wallets`: one balance per `player_id + game_id + currency_code`.
- `player_game_wallet_transactions`: immutable signed ledger entries with an idempotency key and post-transaction balance.
- `adjust_player_game_wallet(...)`: atomic server-only adjustment function. It serializes updates per wallet, prevents negative balances, and ignores duplicate idempotency keys.

Wallet balances and ledger history are readable only by the owning authenticated player through RLS. Browser clients cannot insert, update, or delete wallet records. The adjustment function is executable only by `service_role`; call it from a trusted server route after resolving the caller with `resolveAuthenticatedPlayer()`. Never accept a client-provided player ID as proof of ownership.

Use a distinct `game_id` for each mini-game. A coin earned in one game must not alter another game's wallet. The initial currency code is `coin`, but the schema supports additional game-specific currency codes.


## Official platform access policy — Account-Based Platform with Progressive Login (November 14, 2026)

This policy supersedes any earlier rule in this document that requires Google login before all main-game launches. Authentication is progressive and based on the capability being used, not a blanket gate.

### Public access — no login
- Homepage, public content, game catalogue, public wedding invitations and previews.
- Supported demo/mini games that do not persist personal progress, submit authenticated competition results, or mutate an account wallet.
- Browsing a game description or preview must not trigger an authentication redirect.

### Account access — authenticate when needed
Require a valid account session when a visitor chooses to use:
- Persistent progress or cross-device synchronization.
- Player profile, personal statistics, achievements, or saved history.
- Leaderboards, ranked competition, or authenticated result submission.
- Wallet, coins, rewards, purchases, entitlements, or other account-bound value.
- Social/saved features that require a stable owner identity.

Do not interrupt a public browsing journey with a login wall. Explain the benefit at the point the user requests an account-dependent action.

### Administrative access
Admin capabilities require a separate server-side permission check on every privileged operation. A logged-in user is not automatically an administrator.

### Canonical identity and ownership
- Supabase Auth user ID is the authentication identity.
- `players.id` is the universal gaming Player ID and must be resolved from the verified Auth identity on the server.
- Product/game records remain scoped by owner and product/game ID.
- Never trust client-supplied IDs, roles, scores, wallet balances, or entitlements.
- Never silently merge two Auth identities. Explicit Guest-to-provider linking must preserve the same Auth user and Player ID. If the provider identity belongs to another account, stop and require the user to sign into that account; do not auto-merge or reassign data.

### Privacy and migration
- Collect the minimum data needed and explain its purpose.
- Public APIs expose only explicitly approved public fields; never expose Auth IDs, emails, tokens, or private metadata.
- Preserve existing Auth accounts, Guest identities, Player IDs, game progress, invitation ownership, and wallet balances.
- No blanket account migration, destructive schema change, production data change, or production release is authorized by this policy alone.

### Required phased rollout
1. Establish the policy and identity contract.
2. Inventory features and classify public/account/admin access; create shared server-side authorization contracts.
3. Migrate each game/product incrementally and test ownership, Guest linking, and return paths.
4. Add privacy notices, account lifecycle, data minimization, and privacy-safe analytics.
5. Complete security, accessibility, mobile, localization, regression, and preview QA before release.

Existing implementations must be audited against this policy before being changed. A policy statement does not mean every current route has already been migrated.


## Current feature access inventory — Phase 2 baseline (November 14, 2026)

This is an implementation inventory, not a claim that all routes have passed end-to-end QA.

| Feature / route | Intended access under Progressive Login | Current observed implementation | Migration note |
|---|---|---|---|
| Homepage and public content | Public | Public routes | Preserve public discovery. |
| `/games` game catalogue | Public | Catalogue loads without an account | Keep browsing public; request login only from a feature launch that needs persistent identity. |
| `/mini-game` and `/mini-game/run-jump` | Public demo/mini game | Runs in browser and stores best score in localStorage | Remains public; local device-only score is not a cross-device account record. |
| Public wedding invitation `/df/...` | Public | Public invitation rendering; RSVP/guestbook are feature-flagged | Keep guest access; protect owner/editor management separately. |
| `/profile` and `/profile/edit` | Account | Login required | Correct: personal profile and account data require identity. |
| `/admin/**` | Admin | Admin login and server-side admin checks | Continue validating every privileged API operation, not only page access. |
| `/games/mamah-ngamuk` | Account for persistent wallet/best distance and leaderboard | Game launch currently prompts for Google; result API requires Google identity; GET has a guest/non-Google fallback | Account gate is justified for saving coins and best distance. Review whether guest demo gameplay can be offered without persisting results in a later game-specific change. |
| Daily Riddle `/game` | Public/guest play; account for saved progress and competition | Game Library currently redirects non-Google users to `/login`; answer API already has a non-Google, non-persistent response branch, while daily-riddle APIs still resolve a player profile | Known progressive-login gap. Do not simply remove the login redirect until anonymous identity/profile provisioning and API ownership behavior are verified end-to-end. |

### Phase 2 findings and implementation constraints

1. The public Game Library and public mini-game routes already follow the no-login discovery principle.
2. MAMAH NGAMUK's Google requirement is currently tied to persistent coins, best distance, and ranked leaderboard behavior. This is a feature-level requirement, not a platform-wide login rule.
3. Daily Riddle contains partial guest-result logic in its answer API, but the launch flow and daily-riddle data API still require a resolvable player profile. The safe next implementation is to complete guest identity/profile provisioning and test the entire guest attempt flow before removing the login prompt.
4. The current `resolveAuthenticatedPlayer()` verifies a Supabase bearer token and resolves the universal Player ID from `auth_user_id`. It is a useful foundation for account-owned APIs; public APIs should not be made to require it merely by convention.
5. The current admin user directory lists player profiles with linked Auth accounts; standalone Auth-only users are not yet included. This remains a separate User Management scope item.
6. Avoid treating localStorage-only demo scores as authoritative account progress. If a game later adds cloud saves, wallet rewards, or ranked competition, move those writes behind authenticated server APIs.

### Next implementation sequence

- **Phase 2A — Shared access contracts:** define reusable server-side account/admin guards and public/account/admin feature metadata without weakening existing route checks.
- **Phase 2B — Daily Riddle guest path:** provision and resolve anonymous player context safely, keep guest results non-persistent, and require account linking/login only when the user opts to save progress or compete.
- **Phase 2C — Account-game consistency:** retain MAMAH NGAMUK account requirements for persistence; assess optional no-save guest demo separately.
- **Phase 2D — Lifecycle and privacy:** notices, account linking/upgrade, deletion/export workflow, and privacy-safe analytics.
- Each phase requires route/API tests and preview QA. No production database changes are implied by this plan.

## Expanded player profile and login identifiers — implementation plan (November 14, 2026)

The account profile expansion is being developed additively. Existing `players.id`, `auth_user_id`, nickname, avatar, game statistics, wallets, and historical ownership must remain unchanged.

### Profile fields

- Display name / nickname: public player-facing name used by profile and leaderboard; preserve the existing `nickname` column and its global case-insensitive uniqueness.
- Username: optional during rollout, unique case-insensitively, ASCII letters and digits only, 3–20 characters. It is a login alias, not a player primary key.
- Gender: optional; supported values are `male` and `female`.
- Phone number: optional, normalized to E.164 format and globally unique. Treat as private account data; never include it in public profile, leaderboard, or public API payloads.
- Birth date: optional; private account data and excluded from public profile/leaderboard responses.
- Darkwar state: optional server number. Keep the existing `server_number` storage field for backward compatibility; update its user-facing label to “State Darkwar” / “State Darkwar (Nomor Server)”.
- Avatar: retain current upload flow and storage ownership checks.

### Password and sign-in model

- Passwords are managed only by Supabase Auth. Never add password or password-confirmation columns to `players`, logs, analytics, or application tables.
- Google users may set an Auth password from Account Security; require confirmation in the UI, validate strength, and submit only the password to Supabase Auth over TLS. Confirmation is client-side validation and is never persisted.
- Login UI accepts email, username, or phone plus password, and retains direct Google OAuth as the alternate method.
- Email login uses Supabase Auth email/password. Username and phone aliases must be resolved in a trusted server-side login flow; never expose a lookup endpoint that reveals the email behind a username/phone. The server must rate-limit attempts and return generic invalid-credentials errors.
- Phone/password login is enabled only after phone verification and confirmation that the Supabase Auth phone/password configuration supports the chosen flow. Do not imply SMS OTP is configured unless it is verified.
- Keep Google OAuth working and preserve the same Auth user and Player ID when a Google user sets a password.
- Do not silently merge accounts or reassign a username/phone alias from one Auth identity to another.

### Public/private field contract

Public profile and leaderboard: display name, avatar, and optional Darkwar state number when intentionally shown.
Private owner/admin-only: email, username where required for account management, phone number, birth date, gender, provider metadata, and sign-in timestamps. Do not expose these via public player endpoints.

### Current implementation status

- Primary navigation: Profile link added immediately before Home on the development branch.
- Draft additive migration created at `supabase/migrations/202611140002_expand_player_profile_identity.sql`; it is NOT applied to Supabase.
- Existing profile edit UI, login UI, and profile APIs still require implementation and QA before the feature is complete.
- No production changes, Auth configuration changes, or database mutations have been made.
