import WeddingInvitationPage from "../wedding-anak-dajjal/page";

export const metadata = {
  title: "Anak Dajjal & Malika Wedding Invitation",
  description: "Open the digital wedding invitation for Anak Dajjal and Malika.",
  alternates: {
    canonical: "https://dajjalfamily.com/df/wedding-anak-dajjal",
  },
  openGraph: {
    title: "Anak Dajjal & Malika Wedding Invitation | Dajjal Family",
    description: "You are invited to celebrate a special day. Open the digital invitation for details.",
    url: "https://dajjalfamily.com/df/wedding-anak-dajjal",
    siteName: "Dajjal Family",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function AnakDajjalMalikaInvitation() {
  return <WeddingInvitationPage invitationSlug="anak-dajjal-malika" />;
}
