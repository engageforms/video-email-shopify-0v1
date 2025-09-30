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
    const checkout = payload as any;
    const checkoutId = checkout.id.toString();

    // Check if checkout was completed or abandoned
    if (checkout.completed_at) {
      // Checkout was completed - mark as completed, no video needed
      const existingRecords = await db.customerVideoData.findMany({
        where: {
          shop: shop,
          orderId: checkoutId
        }
      });

      for (const record of existingRecords) {
        await db.customerVideoData.update({
          where: { id: record.id },
          data: {
            status: "checkout_completed"
          }
        });
      }
    } else {
      // Checkout is still in progress - update status
      const existingRecords = await db.customerVideoData.findMany({
        where: {
          shop: shop,
          orderId: checkoutId
        }
      });

      for (const record of existingRecords) {
        await db.customerVideoData.update({
          where: { id: record.id },
          data: {
            status: "checkout_updated"
          }
        });
      }
    }

    console.log(`Updated checkout video data for checkout ${checkoutId}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing checkout update webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
