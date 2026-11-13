import { notFound } from "next/navigation";
import WeddingInvitationPage from "../wedding-anak-dajjal/page";

export default async function InvitationSlugPage({ params }) {
  const { slug } = await params;
  if (!slug?.startsWith("wedding=")) notFound();
  const invitationSlug = slug.slice("wedding=".length);
  if (!invitationSlug) notFound();
  return <WeddingInvitationPage invitationSlug={invitationSlug} />;
}
