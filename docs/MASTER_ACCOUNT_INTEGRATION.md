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
