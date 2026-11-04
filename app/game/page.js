
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function GamePage() {
  const router = useRouter();

  const [player, setPlayer] = useState(null);
  const [riddle, setRiddle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finished = correct || attemptsLeft <= 0;

  useEffect(() => {
    async function loadGame() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const session = data.session;

        if (!session) {
          router.replace("/register");
          return;
        }

        const response = await fetch("/api/riddle/today", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (
          response.status === 401 ||
          (response.status === 404 &&
            result.error === "Player profile not found")
        ) {
          router.replace("/register");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load today's riddle."
          );
        }

        setPlayer(result.player);
        setRiddle(result.riddle);

        const progress = result.progress || {};

        const remaining = progress.attemptsLeft ?? 3;
        const used = progress.attempts ?? 0;
        const completed = Boolean(progress.completed);

        setAttemptsLeft(remaining);
        setAttemptsUsed(used);
        setScore(progress.score ?? 0);
        setCorrect(completed);

        if (completed) {
          setMessage(
            "You have already completed today's riddle. Come back tomorrow!"
          );
        } else if (remaining <= 0) {
          setMessage(
            "You have used all your attempts today. Come back tomorrow!"
          );
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [router]);

  async function handleAnswer(e) {
    e.preventDefault();

    if (!answer.trim() || submitting || finished) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = data.session;

      if (!session) {
        router.replace("/register");
        return;
      }

      const response = await fetch("/api/riddle/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answer }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to check answer.");
      }

      const remaining = result.attemptsLeft ?? 0;
      const used =
        result.attempts ??
        result.attemptsUsed ??
        (3 - remaining);

      setAttemptsLeft(remaining);
      setAttemptsUsed(used);
      setScore(result.score || 0);
      setCorrect(Boolean(result.correct));
      setMessage(result.message || "");

      setAnswer("");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-purple-300">
        Loading today's mystery...
      </div>
    );
  }

  if (error || !riddle || !player) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-purple-400">
            THE DAILY RIDDLE
          </h1>
          <p className="text-gray-400 mt-4">
            {error || "Today's riddle is not available yet."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-xl font-bold"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // FINAL RESULT SCREEN
  if (finished) {
    return (
      <div className="min-h-[70vh] bg-[#080711] text-white px-5 py-10">
        <div className="max-w-xl mx-auto">

          <div className="border border-purple-500/30 rounded-2xl bg-[#151020] p-6 sm:p-8 text-center">

            <div className="text-5xl mb-4">
              {correct ? "🏆" : "🌙"}
            </div>

            <p className="text-purple-400 text-xs tracking-[0.3em]">
              THE DAILY RIDDLE
            </p>

            <h1 className="text-2xl sm:text-3xl font-black mt-3">
              {correct ? "RIDDLE COMPLETED!" : "CHALLENGE FINISHED"}
            </h1>

            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {correct
                ? "You have completed today's riddle. Here is your result!"
                : "You have used all your attempts. Better luck with tomorrow's riddle!"}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8">

              <div className="bg-[#080711] rounded-xl p-5">
                <p className="text-3xl font-black text-purple-400">
                  {score}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  POINTS EARNED
                </p>
              </div>

              <div className="bg-[#080711] rounded-xl p-5">
                <p className="text-3xl font-black text-purple-400">
                  {attemptsUsed}/3
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  ATTEMPTS USED
                </p>
              </div>

            </div>

            <div className="mt-6 border-t border-purple-500/20 pt-5">

              <p className="text-gray-400 text-xs">
                PLAYER
              </p>

              <p className="font-bold mt-1">
                {player.nickname}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                Server {player.server_number}
              </p>

            </div>

            {correct && (
              <p className="text-green-400 text-sm mt-6 font-semibold">
                ✓ Correct answer!
              </p>
            )}

            <div className="mt-8 bg-[#080711] rounded-xl p-4">
              <p className="text-yellow-400 font-bold text-sm">
                COME BACK TOMORROW
              </p>
              <p className="text-gray-400 text-xs mt-2">
                A new mystery awaits you every day.
              </p>
            </div>

            <Link
              href="/profile"
              className="block mt-6 bg-purple-600 hover:bg-purple-500 rounded-xl py-4 font-bold transition"
            >
              VIEW MY PROFILE
            </Link>

          </div>

          <p className="text-center text-gray-600 text-xs mt-8">
            ONE DAY. ONE RIDDLE. ONE CHAMPION.
          </p>

        </div>
      </div>
    );
  }

  // ACTIVE QUIZ SCREEN
  return (
    <div className="min-h-[70vh] bg-[#080711] text-white px-5 py-10">
      <div className="max-w-xl mx-auto">

        <p className="text-purple-400 text-xs tracking-[0.3em]">
          THE DAILY RIDDLE
        </p>

        <h1 className="text-2xl font-black mt-4">
          Welcome, {player.nickname}!
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Server {player.server_number}
        </p>

        <div className="mt-8 border border-purple-500/30 rounded-2xl p-6 bg-[#151020]">

          <p className="text-purple-400 text-xs tracking-widest">
            TODAY'S MYSTERY
          </p>

          <h2 className="text-xl font-bold mt-4">
            Solve the Riddle
          </h2>

          <p className="text-gray-200 leading-relaxed mt-5">
            {riddle.question}
          </p>

          {riddle.hint && (
            <div className="mt-5 bg-[#080711] rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-bold">
                HINT
              </p>
              <p className="text-gray-300 text-sm mt-2">
                {riddle.hint}
              </p>
            </div>
          )}

          <div className="flex justify-between text-sm mt-6">
            <span className="text-gray-400">
              Attempts left: {attemptsLeft}/3
            </span>
            <span className="text-purple-400 font-bold">
              {riddle.points} points
            </span>
          </div>

          <form onSubmit={handleAnswer} className="mt-5">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              placeholder="Type your answer..."
              maxLength={200}
              className="w-full bg-[#080711] border border-purple-500/30 rounded-xl p-4 outline-none focus:border-purple-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!answer.trim() || submitting}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl py-4 font-bold tracking-wider"
            >
              {submitting ? "CHECKING..." : "SUBMIT ANSWER"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-xl p-4 text-center bg-red-500/10 text-red-400">
              {message}
            </div>
          )}

        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          ONE DAY. ONE RIDDLE. ONE CHAMPION.
        </p>

      </div>
    </div>
  );
}
