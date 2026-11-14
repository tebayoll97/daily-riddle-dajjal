import "./df.css";
import DFHeader from "./components/DFHeader";
import DFFooter from "./components/DFFooter";

export const metadata = {
  title: {
    default: "Dajjal Family",
    template: "%s | Dajjal Family",
  },
  description: "Enter the Dajjal Family universe: family projects, games, and special events.",
};

export default function DFLayout({ children }) {
  return (
    <div className="df-shell">
      <DFHeader />
      <div className="df-main">{children}</div>
      <DFFooter />
    </div>
  );
}
