
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
  thinking: "float",
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

  const expressionIndex = EXPRESSIONS.indexOf(selectedExpression);

  const column = expressionIndex % 4;
  const row =
    selectedCharacter.startRow + Math.floor(expressionIndex / 4);

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
        className={`game-character character-${selectedAnimation} ${className}`}
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
          will-change: transform;
          transform-origin: center bottom;
        }

        .character-idle {
          animation: idle 2.8s ease-in-out infinite;
        }

        .character-bounce {
          animation: bounce 1.1s ease-in-out infinite;
        }

        .character-shake {
          animation: shake 0.35s ease-in-out infinite;
        }

        .character-float {
          animation: float 2s ease-in-out infinite;
        }

        .character-pop {
          animation: pop 0.8s ease-in-out infinite;
        }

        .character-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .character-sleep {
          animation: sleep 3s ease-in-out infinite;
        }

        @keyframes idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-12px); }
          50% { transform: translateY(0); }
          70% { transform: translateY(-5px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          75% { transform: translateX(3px) rotate(2deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.09); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        @keyframes sleep {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(4deg) translateY(3px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .game-character {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
