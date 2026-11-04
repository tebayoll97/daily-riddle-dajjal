
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-purple-500/20 bg-[#080711] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center gap-4">
          <Link href="/" className="text-sm font-black tracking-widest">
            THE <span className="text-purple-400">DAILY RIDDLE</span>
          </Link>

          <p className="text-gray-500 text-xs">
            One day. One riddle. One champion.
          </p>

          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/" className="hover:text-purple-400">
              Home
            </Link>
            <Link href="/game" className="hover:text-purple-400">
              Play
            </Link>
            <Link href="/leaderboard" className="hover:text-purple-400">
              Ranking
            </Link>
            <Link href="/profile" className="hover:text-purple-400">
              Profile
            </Link>
          </div>

          <p className="text-[10px] text-gray-600 mt-2">
            © 2026 THE DAILY RIDDLE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
