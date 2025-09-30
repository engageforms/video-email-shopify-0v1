import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { MetaObjectsService } from "../services/metaobjects.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const checkout = payload as any;
    const customer = checkout.customer;
    const lineItems = checkout.line_items;

    if (customer && lineItems && lineItems.length > 0) {
      // Store checkout data for abandonment tracking
      for (const lineItem of lineItems) {
        const productId = lineItem.product_id;
        
        // Create meta object in Shopify
        const metaObjectsService = new MetaObjectsService(session.accessToken, shop);
        const metaObjectResult = await metaObjectsService.createCustomerVideoMetaObject({
          customerEmail: customer.email,
          customerFirstName: customer.first_name,
          customerLastName: customer.last_name,
          productId: productId.toString(),
          orderId: checkout.id.toString(),
          status: "checkout_created"
        });

        await db.customerVideoData.create({
          data: {
            shop: shop,
            customerEmail: customer.email,
            customerFirstName: customer.first_name,
            customerLastName: customer.last_name,
            productId: productId.toString(),
            orderId: checkout.id.toString(),
            status: "checkout_created",
            metaObjectId: metaObjectResult.id,
          }
        });

        console.log(`Created checkout video data for ${customer.email} and product ${productId}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing checkout webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
