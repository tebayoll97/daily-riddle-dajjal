
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  const result = await verifyAdmin(request);

  if (!result.authorized) {
    return Response.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return Response.json({
    success: true,
    admin: {
      id: result.user.id,
      email: result.user.email,
    },
  });
}
