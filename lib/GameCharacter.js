
"use client";

const CHARACTERS = {
  dajjal: {
    name: "Dajjal",
    startRow: 0,
  },
  veylora: {
    name: "Veylora",
    startRow: 2,
  },
  child: {
    name: "Anak Dajjal",
    startRow: 4,
  },
};

const EXPRESSIONS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "surprised",
  "thinking",
  "smug",
  "sleepy",
];

const DEFAULT_ANIMATIONS = {
  neutral: "idle",
  happy: "bounce",
  sad: "float",
  angry: "shake",
  surprised: "pop",
  thinking: "think",
  smug: "pulse",
  sleepy: "sleep",
};

const ANIMATIONS = [
  "none",
  "idle",
  "bounce",
  "shake",
  "float",
  "pop",
  "pulse",
  "sleep",
  "think",
];

export default function GameCharacter({
  character = "dajjal",
  expression = "neutral",
  animation,
  size = 120,
  className = "",
  alt,
}) {
  const selectedCharacter =
    CHARACTERS[character] || CHARACTERS.dajjal;

  const selectedExpression = EXPRESSIONS.includes(expression)
    ? expression
    : "neutral";

  const expressionIndex = EXPRESSIONS.indexOf(
    selectedExpression
  );

  const column = expressionIndex % 4;

  const row =
    selectedCharacter.startRow +
    Math.floor(expressionIndex / 4);

  const backgroundX = (column / 3) * 100;
  const backgroundY = (row / 5) * 100;

  const selectedAnimation =
    animation === undefined
      ? DEFAULT_ANIMATIONS[selectedExpression]
      : ANIMATIONS.includes(animation)
        ? animation
        : "none";

  return (
    <>
      <div
        key={`${character}-${selectedExpression}`}
        className={`
          game-character
          character-${selectedAnimation}
          expression-enter
          ${className}
        `}
        role="img"
        aria-label={
          alt ||
          `${selectedCharacter.name} - ${selectedExpression}`
        }
        style={{
          width: size,
          height: size,
          backgroundImage: "url('/universe-characters.png')",
          backgroundSize: "400% 600%",
          backgroundPosition: `${backgroundX}% ${backgroundY}%`,
          backgroundRepeat: "no-repeat",
        }}
      />

      <style jsx>{`
        .game-character {
          display: inline-block;
          flex-shrink: 0;
          background-color: transparent;
          background-clip: padding-box;
          transform-origin: center bottom;
          will-change: transform, opacity;
        }

        /* TRANSISI EKSPRESI */

        .expression-enter {
          animation:
            expressionEnter 0.35s ease-out,
            var(--character-motion, none);
        }

        @keyframes expressionEnter {
          from {
            opacity: 0.45;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* IDLE */

        .character-idle {
          animation:
            expressionEnter 0.35s ease-out,
            idle 2.8s ease-in-out 0.35s infinite;
        }

        @keyframes idle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* HAPPY */

        .character-bounce {
          animation:
            expressionEnter 0.35s ease-out,
            bounce 1.1s ease-in-out 0.35s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-12px);
          }
          50% {
            transform: translateY(0);
          }
          70% {
            transform: translateY(-5px);
          }
        }

        /* ANGRY */

        .character-shake {
          /* Shake is a brief reaction, not a continuous idle animation. */
          animation:
            expressionEnter 0.35s ease-out,
            shake 0.42s ease-in-out 0.35s 1 both;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0) rotate(0);
          }
          20% {
            transform: translateX(-3px) rotate(-2deg);
          }
          40% {
            transform: translateX(3px) rotate(2deg);
          }
          60% {
            transform: translateX(-2px) rotate(-1deg);
          }
          80% {
            transform: translateX(1px) rotate(0.5deg);
          }
        }

        /* SAD */

        .character-float {
          animation:
            expressionEnter 0.35s ease-out,
            float 2.4s ease-in-out 0.35s infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* SURPRISED */

        .character-pop {
          animation:
            expressionEnter 0.35s ease-out,
            pop 1.2s ease-in-out 0.35s infinite;
        }

        @keyframes pop {
          0%, 100% {
            transform: scale(1);
          }
          35% {
            transform: scale(1.1);
          }
          55% {
            transform: scale(0.98);
          }
        }

        /* SMUG */

        .character-pulse {
          animation:
            expressionEnter 0.35s ease-out,
            pulse 1.8s ease-in-out 0.35s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.045);
          }
        }

        /* SLEEPY */

        .character-sleep {
          animation:
            expressionEnter 0.35s ease-out,
            sleep 3s ease-in-out 0.35s infinite;
        }

        @keyframes sleep {
          0%, 100% {
            transform: rotate(0) translateY(0);
          }
          50% {
            transform: rotate(4deg) translateY(3px);
          }
        }

        /* THINKING */

        .character-think {
          animation:
            expressionEnter 0.35s ease-out,
            think 2.2s ease-in-out 0.35s infinite;
        }

        @keyframes think {
          0%, 100% {
            transform: rotate(0) translateY(0);
          }
          50% {
            transform: rotate(-3deg) translateY(-3px);
          }
        }

        /* REDUCE MOTION */

        @media (prefers-reduced-motion: reduce) {
          .game-character {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
