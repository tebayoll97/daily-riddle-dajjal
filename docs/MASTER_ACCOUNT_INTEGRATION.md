# Master Account Integration Contract

This project is the central identity provider for Dajjal Family Gaming Universe.

## Identity shared by every game

- Supabase Auth user (Google identity or anonymous Guest identity)
- `players.id` — the stable universal Player ID
- `players.nickname` — one globally unique nickname
- `players.avatar_url` — the shared player avatar

A game must resolve the current authenticated user to the existing `players` row by `auth_user_id`. It must never create a second player identity for the same user.

Use `getPlayerContext()` from `@/lib/playerAccount` in client components:

```js
import { getPlayerContext } from "@/lib/playerAccount";

const context = await getPlayerContext();

if (context.status === "signed_out") {
  // Ask the player to enter the shared registration/login flow.
} else if (context.status === "profile_required") {
  // Continue the shared profile setup flow; do not create a game-local account.
} else {
  // context.player.id is the universal Player ID.
  // context.accountType is "guest", "google", or "registered".
}
```

To explicitly create a Guest Auth identity when the game flow requires it:

```js
const context = await getPlayerContext({ createGuest: true });
```

This option creates only the Supabase Auth Guest identity. It does not create a player profile or game data.

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
