import { notFound } from "next/navigation";
import WeddingInvitationPage from "../wedding-anak-dajjal/page";

const origin = "https://dajjalfamily.com";
const primaryInvitationUrl = `${origin}/df/wedding-anak-dajjal`;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug?.startsWith("wedding=") || !slug.slice("wedding=".length)) return {};

  const invitationSlug = slug.slice("wedding=".length);
  const isKnownLegacyInvitation = invitationSlug === "anak-dajjal-malika";
  const canonical = isKnownLegacyInvitation
    ? primaryInvitationUrl
    : `${origin}/df/${slug}`;

  return {
    title: "Wedding Invitation",
    description: "Open a personal digital wedding invitation from the Dajjal Family universe.",
    alternates: { canonical },
    openGraph: {
      title: "Wedding Invitation | Dajjal Family",
      description: "You are invited to celebrate a special day. Open the digital invitation for details.",
      url: canonical,
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
