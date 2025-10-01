import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  // Ensure webhooks are registered on (re)install
  await registerWebhooks({ session });
  // Send merchant into the app home after auth
  return redirect("/app");
};
