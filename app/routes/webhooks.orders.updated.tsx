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
    const order = payload as any;
    const orderId = order.id.toString();

    // Update existing customer video data if order status changed
    const existingRecords = await db.customerVideoData.findMany({
      where: {
        shop: shop,
        orderId: orderId
      }
    });

    for (const record of existingRecords) {
      await db.customerVideoData.update({
        where: { id: record.id },
        data: {
          status: order.fulfillment_status === "fulfilled" ? "ready_for_processing" : "pending_video_generation"
        }
      });
    }

    console.log(`Updated customer video data for order ${orderId}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing order update webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

