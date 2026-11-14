
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 1. Verify administrator
    const auth = await verifyAdmin(request);

    if (!auth.authorized) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "50", 10) || 50
      )
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 3. Get player profiles
    let query = supabaseAdmin
      .from("players")
      .select(
        "id, nickname, server_number, created_at, auth_user_id, avatar_url",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("nickname", `%${search}%`);
    }

    const {
      data: players,
      error: playersError,
      count,
    } = await query;

    if (playersError) {
      console.error("Admin players query error:", playersError);

      return Response.json(
        { error: "Unable to load players." },
        { status: 500 }
      );
    }

    const playerList = players || [];
    const playerIds = playerList.map((player) => player.id);

    // 4. Get scores for the displayed players
    let scoreMap = {};

    if (playerIds.length > 0) {
      const { data: scores, error: scoresError } =
        await supabaseAdmin
          .from("scores")
          .select("player_id, score")
          .in("player_id", playerIds);

      if (scoresError) {
        console.error("Admin player scores error:", scoresError);

        return Response.json(
          { error: "Unable to load player statistics." },
          { status: 500 }
        );
      }

      for (const score of scores || []) {
        if (!scoreMap[score.player_id]) {
          scoreMap[score.player_id] = {
            totalPoints: 0,
            gamesPlayed: 0,
          };
        }

        scoreMap[score.player_id].totalPoints +=
          Number(score.score) || 0;

        scoreMap[score.player_id].gamesPlayed += 1;
      }
    }

    // 5. Identify account providers from Supabase Auth
    const enrichedPlayers = await Promise.all(
      playerList.map(async (player) => {
        let accountType = "UNKNOWN";
        let isBanned = false;
        let authEmail = null;
        let lastSignInAt = null;
        let authUserExists = false;

        if (player.auth_user_id) {
          const { data, error } =
            await supabaseAdmin.auth.admin.getUserById(
              player.auth_user_id
            );

          if (!error && data?.user) {
            const user = data.user;
            authUserExists = true;
            authEmail = user.email || null;
            lastSignInAt = user.last_sign_in_at || null;
            isBanned = Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
            const providers =
              user.app_metadata?.providers || [];

            if (user.is_anonymous === true) {
              accountType = "GUEST";
            } else if (
              user.app_metadata?.provider === "google" ||
              providers.includes("google") ||
              user.identities?.some(
                (identity) => identity.provider === "google"
              )
            ) {
              accountType = "GOOGLE";
            } else {
              accountType = "OTHER";
            }
          }
        }

        const stats = scoreMap[player.id] || {
          totalPoints: 0,
          gamesPlayed: 0,
        };

        return {
          id: player.id,
          nickname: player.nickname,
          serverNumber: player.server_number,
          avatarUrl: player.avatar_url,
          createdAt: player.created_at,
          accountType,
          hasAuthLink: Boolean(player.auth_user_id),
          authUserExists,
          authEmail,
          lastSignInAt,
          isBanned,
          totalPoints: stats.totalPoints,
          gamesPlayed: stats.gamesPlayed,
        };
      })
    );

    // 6. Return paginated result
    return Response.json({
      success: true,
      players: enrichedPlayers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error("Admin players API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
