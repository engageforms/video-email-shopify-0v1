import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // This webhook is now for cart abandonment
    // We'll handle this in the cart/checkout webhooks instead
    console.log("Order created - no action needed for abandonment flow");
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing order webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
