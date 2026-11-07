
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
    <main className="lab">\n      <div className="lab-inner">
      <header className="header">
        <div className="brand">DAJJAL FAMILY · GAMING UNIVERSE</div>
        <h1>CHARACTER LAB</h1>
        <p>Character Engine · Reaction Testing</p>
      </header>

      <div className="workspace">\n      <section className="preview">
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

      </div>\n\n      <section className="gallery">
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
        DAJJAL FAMILY · GAMING UNIVERSE
        <br />
        CHARACTER ENGINE 1.0
      </footer>

      <style jsx>{`
        .lab{min-height:100vh;padding:24px clamp(14px,3vw,34px) 48px;color:#f4efff;background:radial-gradient(ellipse at 50% -12%,rgba(105,45,155,.34),transparent 42%),radial-gradient(ellipse at 90% 30%,rgba(38,91,140,.12),transparent 36%),#080711}
        .lab-inner{width:min(100%,1240px);margin:0 auto}
        .header{text-align:center;margin:0 auto 24px}
        .brand{color:#c18aff;font-size:10px;letter-spacing:.28em;font-weight:900}
        .header h1{font-size:clamp(25px,3vw,38px);line-height:1.1;letter-spacing:.06em;margin:10px 0 7px;font-weight:950;background:linear-gradient(100deg,#fff,#d8a6ff 55%,#8bdcff);-webkit-background-clip:text;background-clip:text;color:transparent}
        .header p{color:#a99bbd;font-size:12px}
        .workspace{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);align-items:start;gap:20px}
        .preview{min-width:0;position:sticky;top:18px;padding:22px;text-align:center;border:1px solid rgba(174,103,230,.38);border-radius:22px;background:linear-gradient(145deg,rgba(34,20,52,.96),rgba(15,12,27,.96));box-shadow:0 18px 55px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.035)}
        .preview-label{display:inline-flex;align-items:center;gap:8px;color:#d1a2ff;font-size:10px;letter-spacing:.2em;font-weight:900}
        .preview-label:before{content:"";width:6px;height:6px;border-radius:50%;background:#9d5cff;box-shadow:0 0 12px #b66cff}
        .character-stage{min-height:310px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin:10px 0 2px;border-radius:18px;background:radial-gradient(ellipse at center,rgba(139,76,190,.18),transparent 62%),linear-gradient(180deg,rgba(255,255,255,.018),transparent)}
        .preview h2{margin:10px 0 5px;font-size:23px;font-weight:900}
        .current-expression{color:#c18aff;font-size:10px;letter-spacing:.16em;font-weight:800}
        .reaction-message{max-width:440px;margin:14px auto 0;padding:12px 14px;border:1px solid rgba(172,105,223,.18);border-radius:12px;background:rgba(40,24,58,.72);color:#ead8ff;font-size:13px;line-height:1.5;animation:messageIn .3s ease-out}
        @keyframes messageIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .controls,.gallery{min-width:0;padding:22px;border:1px solid rgba(120,78,158,.28);border-radius:20px;background:linear-gradient(145deg,rgba(24,16,37,.96),rgba(14,11,24,.96));box-shadow:0 14px 40px rgba(0,0,0,.16)}
        h3{color:#d0a0ff;font-size:11px;letter-spacing:.14em;font-weight:900;margin:24px 0 12px}
        .controls h3:first-child{margin-top:0}
        .description{color:#a99bbd;font-size:12px;line-height:1.6}
        button,select{color:#eee5ff;background:rgba(37,23,53,.9);border:1px solid rgba(132,91,166,.34);border-radius:11px;cursor:pointer;font-size:12px;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}
        button:hover{border-color:rgba(205,155,255,.72);background:rgba(83,48,113,.8)}
        button:active{transform:scale(.98)}
        button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #c18aff;outline-offset:3px}
        button.selected{background:linear-gradient(135deg,#7136a0,#4b2a70);border-color:#d49bff;box-shadow:0 0 0 1px rgba(212,155,255,.12),0 7px 20px rgba(125,55,175,.2)}
        .reaction-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
        .reaction-grid button{min-height:58px;display:flex;align-items:center;gap:10px;padding:10px 12px;text-align:left}
        .reaction-icon{font-size:21px}
        .character-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        .character-buttons button{min-height:42px;padding:9px 5px;border-color:var(--accent);font-weight:800}
        .expression-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
        .expression-grid button{min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-transform:capitalize}
        .expression-icon{font-size:22px}
        select{width:100%;min-height:44px;padding:10px 13px;outline:none}
        .size-control{display:flex;align-items:center;gap:10px;font-size:10px;color:#b9a8ca}
        .size-control input{flex:1;min-width:0;accent-color:#bb72ff}
        .size-value{text-align:center;margin-top:8px;color:#d5adff;font-size:11px;font-weight:800}
        .reset{width:100%;min-height:44px;padding:11px;margin-top:18px;background:linear-gradient(100deg,#48216c,#66358d);border-color:#8750ad;font-weight:900;letter-spacing:.1em}
        .gallery{margin-top:20px}
        .gallery>h3{margin-top:0}
        .gallery>p{color:#a99bbd;font-size:12px}
        .gallery-character{margin-top:24px;padding-top:18px;border-top:1px solid rgba(153,112,187,.15)}
        .gallery-character h4{color:#e4c9ff;margin-bottom:12px;font-size:14px;font-weight:900}
        .gallery-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:9px}
        .gallery-grid button{min-width:0;min-height:128px;padding:7px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-transform:capitalize;overflow:hidden;background:rgba(34,22,48,.72)}
        .gallery-grid button span{font-size:10px;color:#cdb8df}
        footer{text-align:center;color:#806b98;font-size:9px;letter-spacing:.18em;line-height:2;margin-top:28px}
        @media(max-width:700px){
          .lab{padding:18px 12px 34px}.header{margin-bottom:16px}.brand{font-size:9px;letter-spacing:.22em}.header h1{margin-top:8px;font-size:25px}.header p{font-size:11px}
          .workspace{display:flex;flex-direction:column;gap:12px}.preview,.controls,.gallery{width:100%;padding:15px;border-radius:16px}
          .preview{position:sticky;top:124px;z-index:40;display:grid;grid-template-columns:112px minmax(0,1fr);grid-template-areas:"label label" "stage name" "stage expression" "message message";align-items:center;column-gap:12px;padding:11px 12px;background:rgba(22,14,34,.97);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.35)}
          .preview-label{grid-area:label;justify-self:start;font-size:9px;margin-bottom:4px}.character-stage{grid-area:stage;min-height:112px;height:112px;margin:0}.preview h2{grid-area:name;text-align:left;font-size:16px;margin:0 0 3px}.current-expression{grid-area:expression;text-align:left;font-size:9px}.reaction-message{grid-area:message;max-width:none;margin:7px 0 0;padding:7px 9px;font-size:10px;line-height:1.35}
          .reaction-message{margin-top:10px;padding:10px 11px;font-size:12px}.controls h3{margin:19px 0 10px;font-size:10px}.description{font-size:11px}
          .reaction-grid{gap:7px}.reaction-grid button{min-height:52px;padding:8px 9px;gap:8px;font-size:11px}.reaction-icon{font-size:19px}
          .character-buttons{gap:6px}.character-buttons button{min-height:40px;font-size:10px}.expression-grid{gap:6px}.expression-grid button{min-height:65px;font-size:10px}.expression-icon{font-size:20px}
          .gallery{margin-top:12px}.gallery-character{margin-top:18px;padding-top:14px}.gallery-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.gallery-grid button{min-height:112px;padding:5px 2px}.gallery-grid button span{font-size:9px}
        }
        @media(min-width:701px){.preview{min-height:480px}.controls{padding:24px}.gallery-grid button:hover{transform:translateY(-2px)}}
        @media(min-width:1100px){.workspace{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px}.character-stage{min-height:360px}.gallery{padding:26px}}
        @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>
    </main>
  );
}
