import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { sendEmail, renderTemplate } from "../services/email.server";

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

      // If the checkout has become abandoned, send email once
      const abandoned = checkout.abandoned_checkout_url || (!checkout.completed_at && checkout.presentment_currency && checkout.recovery_url);
      if (abandoned && checkout.customer?.email) {
        // Fetch default template
        const template = await db.emailTemplate.findFirst({
          where: { shop, isDefault: true },
          orderBy: { createdAt: 'desc' },
        });
        // Map product to video URL (first matching item)
        const productId = checkout.line_items?.[0]?.product_id?.toString();
        const mapping = productId ? await (db as any).productVideo.findUnique({
          where: { shop_productId: { shop, productId } },
        }) : null;

        if (template && mapping) {
          const html = renderTemplate({
            templateBody: template.body,
            variables: {
              customer_first_name: checkout.customer?.first_name || "",
              customer_last_name: checkout.customer?.last_name || "",
              video_link: mapping.videoUrl,
              product_id: productId || "",
            },
          });

          await sendEmail({
            to: checkout.customer.email,
            subject: template.subject,
            html,
          });
        }
      }
    }

    console.log(`Updated checkout video data for checkout ${checkoutId}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing checkout update webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
