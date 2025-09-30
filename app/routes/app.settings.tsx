import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  InlineStack,
  Modal,
  TextField,
  FormLayout,
  TextContainer,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "generate_example") {
    // This would trigger the example video generation
    // For now, we'll just return success
    return { success: true, message: "Example video generation started" };
  }

  return null;
};

export default function Settings() {
  const fetcher = useFetcher();
  const [modalActive, setModalActive] = useState(false);
  const [exampleData, setExampleData] = useState({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
  });

  const handleGenerateExample = useCallback(() => {
    setExampleData({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    });
    setModalActive(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalActive(false);
  }, []);

  const handleSubmitExample = useCallback(() => {
    const form = new FormData();
    form.append("action", "generate_example");
    form.append("customerName", exampleData.customerName);
    form.append("customerEmail", exampleData.customerEmail);
    
    fetcher.submit(form, { method: "post" });
    handleModalClose();
  }, [exampleData, fetcher, handleModalClose]);

  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Video Personalization Settings
                </Text>
                <Text variant="bodyMd" as="p">
                  Configure your video personalization app settings and generate example videos.
                </Text>
                
                <Divider />
                
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Example Video Generation
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Generate an example video to see what your customers will receive. This helps you preview the final result.
                  </Text>
                  <Button onClick={handleGenerateExample}>
                    Generate Example Video
                  </Button>
                </BlockStack>

                <Divider />

                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Backend Configuration
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Your Rails backend is configured with the following services:
                  </Text>
                  <TextContainer>
                    <ul>
                      <li><strong>FFmpeg:</strong> Video processing and personalization</li>
                      <li><strong>Sidekiq:</strong> Background job processing</li>
                      <li><strong>Backblaze B2:</strong> Video storage and hosting</li>
                      <li><strong>Email Service:</strong> Customer notification system</li>
                    </ul>
                  </TextContainer>
                </BlockStack>

                <Divider />

                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Webhook Configuration
                  </Text>
                  <Text variant="bodyMd" as="p">
                    The following webhooks are configured to trigger video generation:
                  </Text>
                  <TextContainer>
                    <ul>
                      <li><strong>orders/create:</strong> Triggers when a new order is created</li>
                      <li><strong>orders/updated:</strong> Triggers when an order status changes</li>
                      <li><strong>checkouts/create:</strong> Triggers when a checkout is created</li>
                      <li><strong>checkouts/update:</strong> Triggers when a checkout is updated</li>
                    </ul>
                  </TextContainer>
                </BlockStack>

                <Banner status="info">
                  <Text variant="bodyMd" as="p">
                    Make sure your Rails backend is running and properly configured with the required environment variables for Backblaze B2, email service, and other integrations.
                  </Text>
                </Banner>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title="Generate Example Video"
        primaryAction={{
          content: 'Generate',
          onAction: handleSubmitExample,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Customer Name"
              value={exampleData.customerName}
              onChange={(value) => setExampleData({ ...exampleData, customerName: value })}
              placeholder="John Doe"
            />
            <TextField
              label="Customer Email"
              value={exampleData.customerEmail}
              onChange={(value) => setExampleData({ ...exampleData, customerEmail: value })}
              placeholder="john@example.com"
            />
            <TextContainer>
              <Text variant="bodyMd" as="p">
                This will generate an example video with the specified customer name to show you what your customers will receive.
              </Text>
            </TextContainer>
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

