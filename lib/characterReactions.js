
export const CHARACTER_REACTIONS = {
  gameStart: {
    character: "dajjal",
    expression: "neutral",
    animation: "idle",
    message: "Tantangan dimulai!",
  },

  checking: {
    character: "veylora",
    expression: "thinking",
    animation: "think",
    message: "Sedang memeriksa...",
  },

  correct: {
    character: "veylora",
    expression: "happy",
    animation: "bounce",
    message: "Jawaban benar!",
  },

  wrong: {
    character: "dajjal",
    expression: "smug",
    animation: "pulse",
    message: "Hehehe... belum tepat!",
  },

  lastChance: {
    character: "dajjal",
    expression: "surprised",
    animation: "pop",
    message: "Kesempatan terakhir!",
  },

  completed: {
    character: "veylora",
    expression: "happy",
    animation: "bounce",
    message: "Tantangan selesai!",
  },

  failed: {
    character: "child",
    expression: "sad",
    animation: "float",
    message: "Yah, coba lagi besok!",
  },

  waiting: {
    character: "child",
    expression: "sleepy",
    animation: "sleep",
    message: "Menunggu tantangan berikutnya...",
  },
};

export function getCharacterReaction(event) {
  return (
    CHARACTER_REACTIONS[event] ||
    CHARACTER_REACTIONS.gameStart
  );
}
