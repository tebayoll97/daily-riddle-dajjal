import { notFound } from "next/navigation";
import WeddingInvitationPage from "../wedding-anak-dajjal/page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug?.startsWith("wedding=") || !slug.slice("wedding=".length)) return {};
  const invitationSlug = slug.slice("wedding=".length);
  return {
    title: "Wedding Invitation",
    description: "Open a personal digital wedding invitation from the Dajjal Family universe.",
    alternates: { canonical: `https://dajjalfamily.com/df/${slug}` },
    openGraph: {
      title: "Wedding Invitation | Dajjal Family",
      description: "You are invited to celebrate a special day. Open the digital invitation for details.",
      url: `https://dajjalfamily.com/df/${slug}`,
      siteName: "Dajjal Family",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function InvitationSlugPage({ params }) {
  const { slug } = await params;
  if (!slug?.startsWith("wedding=")) notFound();
  const invitationSlug = slug.slice("wedding=".length);
  if (!invitationSlug) notFound();
  return <WeddingInvitationPage invitationSlug={invitationSlug} />;
}
