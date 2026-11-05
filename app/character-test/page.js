
"use client";

import { useState } from "react";
import GameCharacter from "@/lib/GameCharacter";
import { getCharacterReaction } from "@/lib/characterReactions";

const characters = [
  { id: "dajjal", name: "Dajjal", color: "#ff623e" },
  { id: "veylora", name: "Veylora", color: "#62c9ff" },
  { id: "child", name: "Anak Dajjal", color: "#c08aff" },
];

const expressions = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "surprised",
  "thinking",
  "smug",
  "sleepy",
];

const animations = [
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

const reactionEvents = [
  { id: "gameStart", label: "Game Dimulai", icon: "🎮" },
  { id: "checking", label: "Memeriksa", icon: "🔍" },
  { id: "correct", label: "Jawaban Benar", icon: "🎉" },
  { id: "wrong", label: "Jawaban Salah", icon: "❌" },
  { id: "lastChance", label: "Kesempatan Terakhir", icon: "⚠️" },
  { id: "completed", label: "Game Selesai", icon: "🏆" },
  { id: "failed", label: "Gagal", icon: "😢" },
  { id: "waiting", label: "Menunggu", icon: "💤" },
];

export default function CharacterTestPage() {
  const [character, setCharacter] = useState("dajjal");
  const [expression, setExpression] = useState("neutral");
  const [animation, setAnimation] = useState("idle");
  const [size, setSize] = useState(180);
  const [message, setMessage] = useState("Pilih reaksi untuk memulai.");
  const [activeReaction, setActiveReaction] = useState("");

  const currentCharacter =
    characters.find((item) => item.id === character);

  function applyReaction(event) {
    const reaction = getCharacterReaction(event);

    setCharacter(reaction.character);
    setExpression(reaction.expression);
    setAnimation(reaction.animation);
    setMessage(reaction.message);
    setActiveReaction(event);
  }

  function resetCharacter() {
    setCharacter("dajjal");
    setExpression("neutral");
    setAnimation("idle");
    setSize(180);
    setMessage("Pilih reaksi untuk memulai.");
    setActiveReaction("");
  }

  return (
    <main className="lab">
      <header className="header">
        <div className="brand">DAJJAL & VEYLORA</div>
        <h1>CHARACTER LAB</h1>
        <p>Character Engine · Reaction Testing</p>
      </header>

      <section className="preview">
        <div className="preview-label">LIVE CHARACTER</div>

        <div className="character-stage">
          <GameCharacter
            character={character}
            expression={expression}
            animation={animation}
            size={size}
          />
        </div>

        <h2>{currentCharacter?.name}</h2>

        <div className="current-expression">
          {expression.toUpperCase()} · {animation.toUpperCase()}
        </div>

        <div className="reaction-message">
          {message}
        </div>
      </section>

      <section className="controls">
        <h3>01. REACTION SYSTEM</h3>
        <p className="description">
          Sentuh kejadian untuk melihat reaksi otomatis karakter.
        </p>

        <div className="reaction-grid">
          {reactionEvents.map((event) => (
            <button
              key={event.id}
              className={
                activeReaction === event.id ? "selected" : ""
              }
              onClick={() => applyReaction(event.id)}
            >
              <span className="reaction-icon">{event.icon}</span>
              <span>{event.label}</span>
            </button>
          ))}
        </div>

        <h3>02. SELECT CHARACTER</h3>

        <div className="character-buttons">
          {characters.map((item) => (
            <button
              key={item.id}
              className={character === item.id ? "selected" : ""}
              onClick={() => {
                setCharacter(item.id);
                setActiveReaction("");
              }}
              style={{ "--accent": item.color }}
            >
              {item.name}
            </button>
          ))}
        </div>

        <h3>03. SELECT EXPRESSION</h3>

        <div className="expression-grid">
          {expressions.map((item) => (
            <button
              key={item}
              className={expression === item ? "selected" : ""}
              onClick={() => {
                setExpression(item);
                setAnimation("none");
                setActiveReaction("");
              }}
            >
              <span className="expression-icon">
                {item === "neutral" && "😐"}
                {item === "happy" && "😄"}
                {item === "sad" && "😢"}
                {item === "angry" && "😠"}
                {item === "surprised" && "😲"}
                {item === "thinking" && "🤔"}
                {item === "smug" && "😏"}
                {item === "sleepy" && "😴"}
              </span>
              <span>{item}</span>
            </button>
          ))}
        </div>

        <h3>04. SELECT ANIMATION</h3>

        <select
          value={animation}
          onChange={(event) => {
            setAnimation(event.target.value);
            setActiveReaction("");
          }}
        >
          {animations.map((item) => (
            <option key={item} value={item}>
              {item.toUpperCase()}
            </option>
          ))}
        </select>

        <h3>05. CHARACTER SIZE</h3>

        <div className="size-control">
          <span>80 px</span>
          <input
            type="range"
            min="80"
            max="280"
            step="10"
            value={size}
            onChange={(event) =>
              setSize(Number(event.target.value))
            }
          />
          <span>280 px</span>
        </div>

        <div className="size-value">{size} PX</div>

        <button className="reset" onClick={resetCharacter}>
          RESET CHARACTER
        </button>
      </section>

      <section className="gallery">
        <h3>06. ALL CHARACTERS PREVIEW</h3>
        <p className="description">
          Pilih ekspresi untuk melihatnya di Live Preview.
        </p>

        {characters.map((item) => (
          <div className="gallery-character" key={item.id}>
            <h4>{item.name}</h4>

            <div className="gallery-grid">
              {expressions.map((exp) => (
                <button
                  key={exp}
                  onClick={() => {
                    setCharacter(item.id);
                    setExpression(exp);
                    setAnimation("none");
                    setActiveReaction("");
                  }}
                >
                  <GameCharacter
                    character={item.id}
                    expression={exp}
                    animation="none"
                    size={85}
                  />
                  <span>{exp}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer>
        DAJJAL & VEYLORA GAMING UNIVERSE
        <br />
        CHARACTER ENGINE 1.0
      </footer>

      <style jsx>{`
        .lab {
          min-height: 100vh;
          padding: 28px 16px 50px;
          color: #f4efff;
          background:
            radial-gradient(ellipse at top, #30134c 0%, #110b20 45%, #080610 100%);
        }

        .header {
          text-align: center;
          margin-bottom: 28px;
        }

        .brand {
          color: #c18aff;
          font-size: 11px;
          letter-spacing: 4px;
          font-weight: 800;
        }

        .header h1 {
          font-size: 30px;
          letter-spacing: 2px;
          margin: 12px 0 5px;
        }

        .header p {
          color: #a99bbd;
          font-size: 12px;
        }

        .preview {
          max-width: 520px;
          margin: 0 auto 30px;
          padding: 20px;
          text-align: center;
          border: 1px solid #7540a0;
          border-radius: 20px;
          background: rgba(30, 17, 46, 0.85);
          box-shadow: 0 0 35px #7625aa22;
        }

        .preview-label {
          color: #c18aff;
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .character-stage {
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .preview h2 {
          margin: 8px 0 5px;
          font-size: 22px;
        }

        .current-expression {
          color: #c18aff;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .reaction-message {
          margin-top: 14px;
          padding: 12px;
          border-radius: 10px;
          background: #28183a;
          color: #ead8ff;
          font-size: 13px;
          animation: messageIn 0.3s ease-out;
        }

        @keyframes messageIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .controls, .gallery {
          max-width: 520px;
          margin: 0 auto 25px;
          padding: 20px;
          border: 1px solid #38234f;
          border-radius: 18px;
          background: #160e23;
        }

        h3 {
          color: #c18aff;
          font-size: 12px;
          letter-spacing: 1.5px;
          margin: 22px 0 13px;
        }

        .controls h3:first-child {
          margin-top: 0;
        }

        .description {
          color: #a99bbd;
          font-size: 12px;
          line-height: 1.6;
        }

        button, select {
          color: #eee5ff;
          background: #251735;
          border: 1px solid #49315f;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
        }

        button.selected {
          background: #65358b;
          border-color: #d49bff;
          box-shadow: 0 0 12px #a34dff55;
        }

        .reaction-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
        }

        .reaction-grid button {
          min-height: 65px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          text-align: left;
        }

        .reaction-icon {
          font-size: 23px;
        }

        .character-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .character-buttons button {
          padding: 12px 4px;
          border-color: var(--accent);
        }

        .expression-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
        }

        .expression-grid button {
          min-height: 75px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: capitalize;
        }

        .expression-icon {
          font-size: 24px;
        }

        select {
          width: 100%;
          padding: 13px;
          outline: none;
        }

        .size-control {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          color: #b9a8ca;
        }

        .size-control input {
          flex: 1;
          min-width: 0;
          accent-color: #bb72ff;
        }

        .size-value {
          text-align: center;
          margin-top: 8px;
          color: #d5adff;
          font-size: 12px;
        }

        .reset {
          width: 100%;
          padding: 13px;
          margin-top: 20px;
          background: #38204e;
          border-color: #8750ad;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .gallery > p {
          color: #a99bbd;
          font-size: 12px;
        }

        .gallery-character {
          margin-top: 25px;
        }

        .gallery-character h4 {
          color: #e4c9ff;
          margin-bottom: 12px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .gallery-grid button {
          min-width: 0;
          min-height: 120px;
          padding: 5px 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: capitalize;
          overflow: hidden;
        }

        .gallery-grid button span {
          font-size: 10px;
        }

        footer {
          text-align: center;
          color: #806b98;
          font-size: 10px;
          letter-spacing: 2px;
          line-height: 2;
          margin-top: 35px;
        }
      `}</style>
    </main>
  );
}
