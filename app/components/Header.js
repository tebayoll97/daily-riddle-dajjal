
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/", icon: "⌂" },
  { name: "Play", href: "/game", icon: "✦" },
  { name: "Ranking", href: "/leaderboard", icon: "♛" },
  { name: "Profile", href: "/profile", icon: "◉" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#080711]/95 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-white">
              THE <span className="text-purple-400">DAILY RIDDLE</span>
            </h1>
            <p className="text-[8px] sm:text-[9px] tracking-[0.2em] text-gray-500">
              ONE DAY. ONE RIDDLE. ONE CHAMPION.
            </p>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 transition text-[10px] sm:text-sm"
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
