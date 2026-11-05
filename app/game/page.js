
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";

const translations = {
  en: {
    loading: "Loading today's mystery...",
    unavailable: "Today's riddle is not available yet.",
    tryAgain: "TRY AGAIN",
    welcome: "Welcome",
    todayMystery: "TODAY'S MYSTERY",
    solveRiddle: "Solve the Riddle",
    hint: "HINT",
    attemptsLeft: "Attempts left",
    points: "points",
    placeholder: "Type your answer...",
    checking: "CHECKING...",
    submit: "SUBMIT ANSWER",
    completed: "RIDDLE COMPLETED!",
    challengeFinished: "CHALLENGE FINISHED",
    completedDesc: "You have completed today's riddle. Here is your result!",
    failedDesc: "You have used all your attempts. Better luck with tomorrow's riddle!",
    pointsEarned: "POINTS EARNED",
    attemptsUsed: "ATTEMPTS USED",
    player: "PLAYER",
    correct: "Correct answer!",
    incorrect: "Incorrect answer. Try again!",
    noAttempts: "You have used all your attempts today. Come back tomorrow!",
    alreadyCompleted: "You have already completed today's riddle. Come back tomorrow!",
    correctMessage: "Correct answer!",
    comeBack: "COME BACK TOMORROW",
    newMystery: "A new mystery awaits you every day.",
    viewProfile: "VIEW MY PROFILE",
    tagline: "ONE DAY. ONE RIDDLE. ONE CHAMPION.",
    genericError: "Something went wrong. Please try again.",
    unableToLoad: "Unable to load today's riddle.",
    unableToCheck: "Unable to check your answer.",
    soundOn: "SOUND ON",
    soundOff: "SOUND OFF",
    successTitle: "CORRECT ANSWER!",
    successDescription: "Brilliant! You solved today's mystery.",
    wrongTitle: "NOT QUITE!",
    wrongDescription: "That is not the answer. Keep thinking!",
    lastChanceTitle: "LAST CHANCE USED!",
    lastChanceDescription: "Today's challenge is over. Try again tomorrow!",
    errorTitle: "OOPS! SOMETHING WENT WRONG",
    close: "CONTINUE",
    remaining: "ATTEMPTS REMAINING",
    victory: "VICTORY",
    tryAgainLabel: "TRY AGAIN",
    finishedLabel: "CHALLENGE FINISHED",
    scoreLabel: "YOUR SCORE",
    server: "SERVER",
  },

  id: {
    loading: "Memuat misteri hari ini...",
    unavailable: "Teka-teki hari ini belum tersedia.",
    tryAgain: "COBA LAGI",
    welcome: "Selamat datang",
    todayMystery: "MISTERI HARI INI",
    solveRiddle: "Pecahkan Teka-Teki",
    hint: "PETUNJUK",
    attemptsLeft: "Kesempatan tersisa",
    points: "poin",
    placeholder: "Ketik jawabanmu...",
    checking: "MEMERIKSA...",
    submit: "KIRIM JAWABAN",
    completed: "TEKA-TEKI SELESAI!",
    challengeFinished: "TANTANGAN SELESAI",
    completedDesc: "Kamu berhasil menyelesaikan teka-teki hari ini. Berikut hasilmu!",
    failedDesc: "Kesempatanmu sudah habis. Semoga besok lebih beruntung!",
    pointsEarned: "POIN DIDAPATKAN",
    attemptsUsed: "KESEMPATAN TERPAKAI",
    player: "PEMAIN",
    correct: "Jawaban benar!",
    incorrect: "Jawaban salah. Coba lagi!",
    noAttempts: "Kesempatanmu hari ini sudah habis. Kembali lagi besok!",
    alreadyCompleted: "Kamu sudah menyelesaikan teka-teki hari ini. Kembali lagi besok!",
    correctMessage: "Jawaban benar!",
    comeBack: "KEMBALI BESOK",
    newMystery: "Misteri baru menantimu setiap hari.",
    viewProfile: "LIHAT PROFIL SAYA",
    tagline: "SATU HARI. SATU TEKA-TEKI. SATU JUARA.",
    genericError: "Terjadi kesalahan. Silakan coba lagi.",
    unableToLoad: "Tidak dapat memuat teka-teki hari ini.",
    unableToCheck: "Tidak dapat memeriksa jawabanmu.",
    soundOn: "SUARA AKTIF",
    soundOff: "SUARA MATI",
    successTitle: "JAWABAN BENAR!",
    successDescription: "Luar biasa! Kamu berhasil memecahkan misteri hari ini.",
    wrongTitle: "BELUM TEPAT!",
    wrongDescription: "Jawabanmu belum benar. Jangan menyerah!",
    lastChanceTitle: "KESEMPATAN HABIS!",
    lastChanceDescription: "Tantangan hari ini telah berakhir. Coba lagi besok!",
    errorTitle: "TERJADI KESALAHAN",
    close: "LANJUTKAN",
    remaining: "KESEMPATAN TERSISA",
    victory: "KEMENANGAN",
    tryAgainLabel: "COBA LAGI",
    finishedLabel: "TANTANGAN SELESAI",
    scoreLabel: "SKOR KAMU",
    server: "SERVER",
  },
};

function playFeedbackSound(type) {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    if (type === "success") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(523.25, now);
      oscillator.frequency.setValueAtTime(659.25, now + 0.13);
      oscillator.frequency.setValueAtTime(783.99, now + 0.26);
      oscillator.frequency.setValueAtTime(1046.5, now + 0.42);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
      gain.gain.setValueAtTime(0.16, now + 0.42);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      oscillator.start(now);
      oscillator.stop(now + 0.86);
    } else if (type === "wrong") {
      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(330, now);
      oscillator.frequency.setValueAtTime(220, now + 0.16);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.setValueAtTime(0.12, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      oscillator.start(now);
      oscillator.stop(now + 0.43);
    }

    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch (error) {
    console.warn("Sound playback unavailable:", error);
  }
}

export default function GamePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [player, setPlayer] = useState(null);
  const [riddle, setRiddle] = useState(null);
  const [answer, setAnswer] = useState("");

  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [score, setScore] = useState(0);

  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const finished = correct || attemptsLeft <= 0;

  useEffect(() => {
    let active = true;

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
          cache: "no-store",
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
          throw new Error(result.error || t.unableToLoad);
        }

        if (!active) return;

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
      } catch (err) {
        console.error("Game loading error:", err);

        if (active) {
          setError(err.message || t.genericError);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGame();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleAnswer(event) {
    event.preventDefault();

    if (!answer.trim() || submitting || finished || feedback) {
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

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
        body: JSON.stringify({ answer: answer.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.unableToCheck);
      }

      const remaining = result.attemptsLeft ?? 0;
      const used =
        result.attempts ??
        result.attemptsUsed ??
        3 - remaining;

      const isCorrect = Boolean(result.correct);

      setAttemptsLeft(remaining);
      setAttemptsUsed(used);
      setScore(result.score ?? 0);
      setCorrect(isCorrect);
      setAnswer("");

      if (isCorrect) {
        setFeedback({
          type: "success",
          points: result.score ?? 0,
          attemptsLeft: remaining,
        });

        if (soundEnabled) {
          playFeedbackSound("success");
        }
      } else if (remaining <= 0) {
        setFeedback({
          type: "failed",
          points: 0,
          attemptsLeft: 0,
        });

        if (soundEnabled) {
          playFeedbackSound("wrong");
        }
      } else {
        setFeedback({
          type: "wrong",
          points: 0,
          attemptsLeft: remaining,
        });

        if (soundEnabled) {
          playFeedbackSound("wrong");
        }
      }
    } catch (err) {
      console.error("Answer submission error:", err);

      setFeedback({
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[65vh] bg-[#080711] text-white flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <p className="text-purple-300 text-sm animate-pulse">
          {t.loading}
        </p>
      </main>
    );
  }

  if (error || !riddle || !player) {
    return (
      <main className="min-h-[65vh] bg-[#080711] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-[#151020] border border-purple-500/20 rounded-2xl p-8">
          <div className="text-4xl mb-4">🔮</div>

          <h1 className="text-2xl font-black text-purple-400">
            THE DAILY RIDDLE
          </h1>

          <p className="text-gray-400 mt-4 text-sm">
            {error || t.unavailable}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold transition"
          >
            {t.tryAgain}
          </button>
        </div>
      </main>
    );
  }

  const question =
    language === "id"
      ? riddle.question_id || riddle.question
      : riddle.question_en || riddle.question;

  const hint =
    language === "id"
      ? riddle.hint_id || riddle.hint
      : riddle.hint_en || riddle.hint;

  const feedbackContent = {
    success: {
      icon: "🏆",
      title: t.successTitle,
      description: t.successDescription,
      color: "text-green-300",
      border: "border-green-400/40",
      background: "bg-green-500/10",
      button: "bg-purple-600 hover:bg-purple-500",
    },
    wrong: {
      icon: "✕",
      title: t.wrongTitle,
      description: t.wrongDescription,
      color: "text-rose-300",
      border: "border-rose-400/30",
      background: "bg-rose-500/10",
      button: "bg-purple-600 hover:bg-purple-500",
    },
    failed: {
      icon: "🌙",
      title: t.lastChanceTitle,
      description: t.lastChanceDescription,
      color: "text-amber-300",
      border: "border-amber-400/30",
      background: "bg-amber-500/10",
      button: "bg-purple-600 hover:bg-purple-500",
    },
    error: {
      icon: "!",
      title: t.errorTitle,
      description: t.genericError,
      color: "text-rose-300",
      border: "border-rose-400/30",
      background: "bg-rose-500/10",
      button: "bg-purple-600 hover:bg-purple-500",
    },
  };

  const currentFeedback = feedback
    ? feedbackContent[feedback.type]
    : null;

  const confettiPieces = Array.from({ length: 22 }, (_, index) => index);

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-[#080711] text-white px-4 py-8 sm:px-5 sm:py-10">

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-purple-400 text-[10px] sm:text-xs tracking-[0.3em] font-bold">
              THE DAILY RIDDLE
            </p>

            <h1 className="text-2xl sm:text-3xl font-black mt-3">
              {finished
                ? correct
                  ? t.completed
                  : t.challengeFinished
                : `${t.welcome}, ${player.nickname}!`}
            </h1>

            <p className="text-gray-500 text-xs mt-2">
              {t.server} {player.server_number}
            </p>
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? t.soundOff : t.soundOn}
            className={`shrink-0 flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold transition ${
              soundEnabled
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-white/10 bg-white/5 text-gray-500"
            }`}
          >
            <span className="text-base">
              {soundEnabled ? "🔊" : "🔇"}
            </span>
            <span className="hidden sm:inline">
              {soundEnabled ? t.soundOn : t.soundOff}
            </span>
          </button>
        </div>

        {/* FINAL RESULT */}
        {finished ? (
          <div className="relative mt-8 overflow-hidden border border-purple-500/30 rounded-3xl bg-gradient-to-b from-[#211536] to-[#100d19] p-6 sm:p-9 text-center shadow-[0_15px_60px_rgba(88,28,135,0.12)]">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-purple-400/70" />

            <div className="text-6xl mb-5">
              {correct ? "🏆" : "🌙"}
            </div>

            <p className="text-purple-400 text-[10px] tracking-[0.3em] font-bold">
              THE DAILY RIDDLE
            </p>

            <h2 className="text-2xl sm:text-3xl font-black mt-3">
              {correct ? t.completed : t.challengeFinished}
            </h2>

            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {correct ? t.completedDesc : t.failedDesc}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-[#080711]/80 border border-purple-500/10 rounded-2xl p-5">
                <p className="text-3xl font-black text-purple-300">
                  {score}
                </p>
                <p className="text-gray-500 text-[10px] tracking-wider mt-2">
                  {t.pointsEarned}
                </p>
              </div>

              <div className="bg-[#080711]/80 border border-purple-500/10 rounded-2xl p-5">
                <p className="text-3xl font-black text-purple-300">
                  {attemptsUsed}/3
                </p>
                <p className="text-gray-500 text-[10px] tracking-wider mt-2">
                  {t.attemptsUsed}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-purple-500/20 pt-5">
              <p className="text-gray-500 text-xs">
                {t.player}
              </p>

              <p className="font-bold mt-1">
                {player.nickname}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                {t.server} {player.server_number}
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-purple-500/20 bg-[#080711]/70 p-5">
              <p className="text-yellow-400 font-bold text-sm tracking-wider">
                {t.comeBack}
              </p>

              <p className="text-gray-400 text-xs mt-2">
                {t.newMystery}
              </p>
            </div>

            <Link
              href="/profile"
              className="block mt-6 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] rounded-xl py-4 font-bold transition"
            >
              {t.viewProfile}
            </Link>
          </div>
        ) : (
          /* ACTIVE QUIZ */
          <>
            <div className="mt-8 border border-purple-500/30 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1c142b] to-[#100d19] shadow-[0_15px_60px_rgba(88,28,135,0.10)]">

              <div className="flex items-center justify-between gap-3">
                <p className="text-purple-400 text-[10px] tracking-[0.25em] font-bold">
                  {t.todayMystery}
                </p>

                <span className="text-[10px] text-gray-500 border border-white/10 rounded-full px-3 py-1">
                  {attemptsUsed}/3
                </span>
              </div>

              <div className="w-16 h-16 mx-auto mt-6 mb-5 rounded-2xl border border-purple-400/20 bg-purple-500/10 flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.10)]">
                <span className="text-4xl">🔮</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-center">
                {t.solveRiddle}
              </h2>

              <div className="mt-6 rounded-2xl bg-[#080711]/70 border border-purple-500/10 p-5 sm:p-6">
                <p className="text-gray-200 text-sm sm:text-base leading-8 text-center whitespace-pre-line">
                  {question}
                </p>
              </div>

              {hint && (
                <div className="mt-5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
                  <p className="text-yellow-400 text-[10px] tracking-[0.2em] font-bold">
                    ✦ {t.hint}
                  </p>

                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                    {hint}
                  </p>
                </div>
              )}

              {/* Attempts and points */}
              <div className="flex items-center justify-between gap-3 mt-7">
                <div>
                  <p className="text-gray-500 text-[10px]">
                    {t.attemptsLeft}
                  </p>

                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3].map((number) => (
                      <span
                        key={number}
                        className={`w-7 h-1.5 rounded-full ${
                          number <= attemptsLeft
                            ? "bg-purple-400"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-500 text-[10px]">
                    {t.points}
                  </p>
                  <p className="text-purple-300 font-black text-lg">
                    {riddle.points}
                  </p>
                </div>
              </div>

              {/* Answer form */}
              <form onSubmit={handleAnswer} className="mt-7">
                <input
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  disabled={submitting || Boolean(feedback)}
                  placeholder={t.placeholder}
                  maxLength={200}
                  autoComplete="off"
                  className="w-full bg-[#080711] border border-purple-500/30 rounded-xl p-4 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 transition disabled:opacity-50 text-sm"
                />

                <button
                  type="submit"
                  disabled={
                    !answer.trim() ||
                    submitting ||
                    Boolean(feedback)
                  }
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 font-bold tracking-wider transition-all shadow-lg shadow-purple-900/20"
                >
                  {submitting ? t.checking : t.submit}
                </button>
              </form>
            </div>
          </>
        )}

        <p className="text-center text-gray-600 text-[10px] tracking-wider mt-8">
          {t.tagline}
        </p>
      </div>

      {/* ANSWER FEEDBACK POPUP */}
      {feedback && currentFeedback && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-5"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="answer-feedback-title"
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border ${currentFeedback.border} bg-[#151020] p-7 sm:p-8 text-center shadow-[0_20px_90px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200`}
          >
            {/* Success confetti */}
            {feedback.type === "success" && (
              <>
                <style jsx>{`
                  @keyframes confettiFall {
                    0% {
                      transform: translateY(-30px) rotate(0deg);
                      opacity: 0;
                    }
                    15% {
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(360px) rotate(720deg);
                      opacity: 0;
                    }
                  }

                  .confetti-piece {
                    position: absolute;
                    top: -20px;
                    width: 7px;
                    height: 12px;
                    border-radius: 2px;
                    animation: confettiFall 2.4s ease-in forwards;
                    pointer-events: none;
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .confetti-piece {
                      animation: none;
                      display: none;
                    }
                  }
                `}</style>

                {confettiPieces.map((piece) => (
                  <span
                    key={piece}
                    className="confetti-piece"
                    style={{
                      left: `${(piece * 37) % 100}%`,
                      background:
                        piece % 3 === 0
                          ? "#facc15"
                          : piece % 3 === 1
                            ? "#c084fc"
                            : "#4ade80",
                      animationDelay: `${(piece % 7) * 0.08}s`,
                    }}
                  />
                ))}
              </>
            )}

            <div className={`relative z-10 w-20 h-20 mx-auto rounded-full ${currentFeedback.background} border ${currentFeedback.border} flex items-center justify-center`}>
              <span className={`text-4xl ${currentFeedback.color}`}>
                {currentFeedback.icon}
              </span>
            </div>

            <p className="relative z-10 text-[10px] text-purple-400 tracking-[0.3em] font-bold mt-6">
              THE DAILY RIDDLE
            </p>

            <h2
              id="answer-feedback-title"
              className={`relative z-10 text-xl sm:text-2xl font-black mt-3 ${currentFeedback.color}`}
            >
              {currentFeedback.title}
            </h2>

            <p className="relative z-10 text-gray-300 text-sm leading-relaxed mt-3">
              {feedback.type === "failed"
                ? t.lastChanceDescription
                : feedback.type === "wrong"
                  ? t.wrongDescription
                  : feedback.type === "success"
                    ? t.successDescription
                    : t.genericError}
            </p>

            {feedback.type === "success" && (
              <div className="relative z-10 mt-6 rounded-2xl bg-yellow-500/10 border border-yellow-400/20 p-4">
                <p className="text-yellow-400 text-[10px] tracking-widest font-bold">
                  {t.scoreLabel}
                </p>

                <p className="text-4xl font-black text-yellow-300 mt-2">
                  +{feedback.points}
                </p>

                <p className="text-yellow-500/70 text-xs mt-1">
                  {t.points}
                </p>
              </div>
            )}

            {feedback.type === "wrong" && (
              <div className="relative z-10 mt-6 rounded-xl bg-[#080711] border border-white/5 p-4">
                <p className="text-gray-500 text-[10px] tracking-widest">
                  {t.remaining}
                </p>

                <p className="text-2xl font-black text-purple-300 mt-2">
                  {feedback.attemptsLeft}/3
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFeedback(null)}
              className={`relative z-10 w-full mt-7 ${currentFeedback.button} active:scale-[0.98] rounded-xl py-4 font-bold text-sm transition`}
            >
              {feedback.type === "wrong"
                ? t.tryAgainLabel
                : feedback.type === "success"
                  ? t.victory
                  : feedback.type === "failed"
                    ? t.finishedLabel
                    : t.close}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
