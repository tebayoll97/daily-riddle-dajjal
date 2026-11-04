
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

        {/* BRAND */}
        <Link href="/" className="flex flex-col items-center py-4">
          <h1 className="text-lg font-black tracking-wider text-white">
            THE <span className="text-purple-400">DAILY RIDDLE</span>
          </h1>
          <p className="text-[9px] tracking-[0.2em] text-gray-500">
            ONE DAY. ONE RIDDLE. ONE CHAMPION.
          </p>
        </Link>

        {/* NAVIGATION */}
        <nav className="grid grid-cols-4 border-t border-purple-500/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-1 py-3 text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 transition"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-xs font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
