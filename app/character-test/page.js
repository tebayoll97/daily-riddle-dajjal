
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
          padding: 24px 16px 48px;
          color: #f4efff;
          background:
            radial-gradient(ellipse at 50% -12%, #3b1b59 0%, transparent 44%),
            linear-gradient(145deg, #0d0917 0%, #080610 58%, #10091b 100%);
        }

        .header {
          max-width: 1200px;
          margin: 0 auto 24px;
          text-align: center;
        }
        .brand {
          color: #c18aff;
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: 800;
        }
        .header h1 {
          font-size: clamp(25px, 4vw, 36px);
          letter-spacing: 2px;
          line-height: 1.1;
          margin: 10px 0 6px;
          font-weight: 900;
          background: linear-gradient(90deg, #f0d9ff, #b66cff, #79d9ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .header p { color: #a99bbd; font-size: 12px; }

        .preview, .controls, .gallery {
          border: 1px solid rgba(174, 112, 225, .22);
          background: linear-gradient(145deg, rgba(28, 18, 43, .96), rgba(15, 11, 25, .96));
          box-shadow: 0 14px 40px rgba(0, 0, 0, .18), inset 0 1px rgba(255,255,255,.025);
          backdrop-filter: blur(12px);
        }
        .preview {
          width: 100%;
          max-width: 560px;
          margin: 0 auto 16px;
          padding: 16px;
          text-align: center;
          border-radius: 20px;
        }
        .preview-label {
          color: #c18aff;
          font-size: 10px;
          letter-spacing: 2.5px;
          font-weight: 800;
        }
        .character-stage {
          min-height: 210px;
          height: clamp(210px, 35vw, 280px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin: 5px 0;
          border-radius: 16px;
          background:
            radial-gradient(ellipse at 50% 58%, rgba(139, 75, 190, .16), transparent 58%),
            linear-gradient(180deg, rgba(255,255,255,.018), transparent);
        }
        .preview h2 { margin: 5px 0 4px; font-size: 20px; font-weight: 850; }
        .current-expression {
          color: #c18aff;
          font-size: 10px;
          letter-spacing: 1.8px;
          font-weight: 800;
        }
        .reaction-message {
          margin-top: 11px;
          padding: 10px 12px;
          border: 1px solid rgba(174,112,225,.14);
          border-radius: 12px;
          background: rgba(40, 24, 58, .72);
          color: #ead8ff;
          font-size: 12px;
          line-height: 1.5;
          animation: messageIn .3s ease-out;
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .controls, .gallery {
          width: 100%;
          max-width: 560px;
          margin: 0 auto 16px;
          padding: 16px;
          border-radius: 18px;
          min-width: 0;
        }
        h3 {
          color: #d0a2ff;
          font-size: 11px;
          letter-spacing: 1.2px;
          font-weight: 850;
          margin: 20px 0 10px;
        }
        .controls h3:first-child { margin-top: 0; }
        .description { color: #a99bbd; font-size: 11px; line-height: 1.55; }

        button, select {
          color: #eee5ff;
          background: rgba(37, 23, 53, .88);
          border: 1px solid rgba(142, 93, 180, .32);
          border-radius: 11px;
          cursor: pointer;
          font-size: 11px;
          transition: background .18s ease, border-color .18s ease, transform .18s ease, box-shadow .18s ease;
        }
        button:hover, select:hover {
          border-color: rgba(202, 151, 255, .7);
          background: rgba(76, 42, 105, .9);
        }
        button:active { transform: scale(.98); }
        button:focus-visible, select:focus-visible, input:focus-visible {
          outline: 2px solid #c18aff;
          outline-offset: 3px;
        }
        button.selected {
          background: linear-gradient(135deg, #693b91, #482765);
          border-color: #d49bff;
          box-shadow: 0 0 0 1px rgba(212,155,255,.12), 0 5px 18px #a34dff25;
        }

        .reaction-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .reaction-grid button {
          min-height: 50px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          text-align: left;
          line-height: 1.25;
        }
        .reaction-icon { font-size: 19px; flex: 0 0 auto; }
        .character-buttons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
        .character-buttons button {
          min-height: 42px;
          padding: 8px 4px;
          border-color: color-mix(in srgb, var(--accent) 48%, transparent);
          font-weight: 750;
        }
        .expression-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
        .expression-grid button {
          min-width: 0;
          min-height: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-transform: capitalize;
        }
        .expression-icon { font-size: 21px; }
        select { width: 100%; padding: 11px 12px; outline: none; }
        .size-control {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #b9a8ca;
          font-size: 10px;
        }
        .size-control input { flex: 1; min-width: 0; accent-color: #bb72ff; }
        .size-value { text-align: center; margin-top: 7px; color: #d5adff; font-size: 11px; font-weight: 800; }
        .reset {
          width: 100%;
          min-height: 42px;
          padding: 10px 13px;
          margin-top: 15px;
          background: linear-gradient(100deg, #60318a, #43205f);
          border-color: #8750ad;
          font-weight: 850;
          letter-spacing: .8px;
        }

        .gallery > p { color: #a99bbd; font-size: 11px; }
        .gallery-character { margin-top: 20px; }
        .gallery-character h4 { color: #e4c9ff; margin-bottom: 10px; font-size: 13px; font-weight: 800; }
        .gallery-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
        .gallery-grid button {
          min-width: 0;
          min-height: 104px;
          padding: 5px 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-transform: capitalize;
          overflow: hidden;
        }
        .gallery-grid button span { font-size: 9px; color: #c8b4dd; }
        footer {
          text-align: center;
          color: #806b98;
          font-size: 9px;
          letter-spacing: 1.7px;
          line-height: 2;
          margin: 25px auto 0;
        }

        /* Tablet and desktop: a dedicated two-column testing workspace. */
        @media (min-width: 900px) {
          .lab {
            display: grid;
            grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
            grid-template-areas:
              "header header"
              "preview controls"
              "preview gallery"
              "footer footer";
            align-items: start;
            column-gap: 22px;
            row-gap: 0;
            max-width: 1440px;
            margin: 0 auto;
            padding: 30px 28px 56px;
          }
          .header { grid-area: header; width: 100%; margin-bottom: 26px; }
          .preview {
            grid-area: preview;
            position: sticky;
            top: 22px;
            max-width: none;
            margin: 0;
            padding: 22px;
          }
          .character-stage { height: 330px; }
          .controls { grid-area: controls; max-width: none; margin: 0 0 18px; padding: 22px; }
          .gallery { grid-area: gallery; max-width: none; margin: 0; padding: 22px; }
          .gallery-grid { grid-template-columns: repeat(4, minmax(100px, 1fr)); gap: 10px; }
          .gallery-grid button { min-height: 130px; }
          .gallery-grid button span { font-size: 10px; }
          .reaction-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        @media (min-width: 1200px) {
          .lab { grid-template-columns: minmax(360px, 470px) minmax(0, 1fr); column-gap: 28px; padding-left: 36px; padding-right: 36px; }
          .character-stage { height: 390px; }
          .gallery-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }

        /* Mobile: compact controls, full-width touch targets, single-column flow. */
        @media (max-width: 480px) {
          .lab { padding: 17px 11px 34px; }
          .header { margin-bottom: 16px; }
          .brand { font-size: 9px; letter-spacing: 2.4px; }
          .header h1 { margin-top: 8px; font-size: 25px; }
          .header p { font-size: 11px; }
          .preview { padding: 12px; margin-bottom: 12px; border-radius: 16px; }
          .character-stage { height: 190px; min-height: 190px; }
          .preview h2 { font-size: 18px; }
          .reaction-message { margin-top: 9px; padding: 9px 10px; font-size: 11px; }
          .controls, .gallery { padding: 13px; margin-bottom: 12px; border-radius: 15px; }
          h3 { margin: 17px 0 9px; font-size: 10px; }
          .description { font-size: 10px; }
          .reaction-grid { gap: 6px; }
          .reaction-grid button { min-height: 46px; padding: 8px; gap: 7px; font-size: 10px; }
          .reaction-icon { font-size: 17px; }
          .character-buttons button { min-height: 39px; font-size: 10px; }
          .expression-grid { gap: 6px; }
          .expression-grid button { min-height: 59px; font-size: 10px; }
          .expression-icon { font-size: 19px; }
          .gallery-character { margin-top: 16px; }
          .gallery-grid { gap: 5px; }
          .gallery-grid button { min-height: 88px; }
          .gallery-grid button span { font-size: 8px; }
          footer { font-size: 8px; letter-spacing: 1.2px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </main>
  );
}
