
export default function Home() {
  return (
    <main className="min-h-screen bg-[#080711] text-white flex flex-col items-center justify-center p-6">

      <div className="text-center max-w-xl w-full">

        <p className="text-purple-400 tracking-[0.4em] text-xs mb-4">
          DAJJAL & VEYLORA PRESENT
        </p>

        <h1 className="text-4xl md:text-6xl font-black tracking-wider">
          THE DAILY
          <span className="block text-purple-500">
            RIDDLE
          </span>
        </h1>

        <p className="text-gray-400 mt-5 text-sm">
          One day. One riddle. One champion.
        </p>

        <div className="mt-10 border border-purple-500/30 rounded-2xl p-8 bg-[#151020]">

          <div className="text-6xl mb-5">🔮</div>

          <h2 className="text-xl font-bold">
            Are You Ready?
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            A new mystery awaits you every day.
          </p>

          <button className="mt-7 w-full bg-purple-600 hover:bg-purple-500 transition rounded-xl py-4 font-bold tracking-wider">
            PLAY TODAY'S RIDDLE
          </button>

        </div>

        <p className="text-gray-600 text-xs mt-8">
          GLOBAL CHALLENGE • ALL SERVERS WELCOME
        </p>

      </div>

    </main>
  );
}
