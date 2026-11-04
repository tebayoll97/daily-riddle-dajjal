
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GamePage() {
  const router = useRouter();

  const [player, setPlayer] = useState(null);
  const [riddle, setRiddle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

        if (response.status === 401 || response.status === 404 &&
            result.error === "Player profile not found") {
          router.replace("/register");
          return;
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load today's riddle.");
        }

        setPlayer(result.player);
        setRiddle(result.riddle);
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

    if (!answer.trim() || submitting || correct || attemptsLeft <= 0) {
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

      setAttemptsLeft(result.attemptsLeft ?? 0);
      setScore(result.score || 0);
      setCorrect(Boolean(result.correct));
      setMessage(result.message || "");

      if (result.correct) {
        setAnswer("");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center">
        Loading today's mystery...
      </main>
    );
  }

  if (error || !riddle || !player) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white p-5">
      <div className="max-w-xl mx-auto pt-8">
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
              disabled={correct || attemptsLeft <= 0 || submitting}
              placeholder="Type your answer..."
              maxLength={200}
              className="w-full bg-[#080711] border border-purple-500/30 rounded-xl p-4 outline-none focus:border-purple-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                !answer.trim() ||
                submitting ||
                correct ||
                attemptsLeft <= 0
              }
              className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl py-4 font-bold tracking-wider"
            >
              {submitting ? "CHECKING..." : "SUBMIT ANSWER"}
            </button>
          </form>

          {message && (
            <div className={`mt-5 rounded-xl p-4 text-center ${
              correct
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}>
              {message}
              {correct && (
                <p className="font-bold mt-2">
                  Your score: {score}
                </p>
              )}
            </div>
          )}

          {attemptsLeft <= 0 && !correct && (
            <p className="text-center text-red-400 text-sm mt-4">
              No attempts left today. Come back tomorrow!
            </p>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          ONE DAY. ONE RIDDLE. ONE CHAMPION.
        </p>
      </div>
    </main>
  );
}
