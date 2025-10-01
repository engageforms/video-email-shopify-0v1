import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  DataTable,
  Badge,
  Button,
  InlineStack,
  Modal,
  TextField,
  Form,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get all customer video data
  const videos = await db.customerVideoData.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: 'desc' },
  });
  // Get product->video mappings
  const mappings = await (db as any).productVideo.findMany({
    where: { shop: session.shop },
    orderBy: { updatedAt: 'desc' },
  });

  return { videos, mappings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "upsert_mapping") {
    const productId = String(formData.get("productId") || "").trim();
    const videoUrl = String(formData.get("videoUrl") || "").trim();

    if (!productId || !videoUrl) return null;

    await (db as any).productVideo.upsert({
      where: { shop_productId: { shop: session.shop, productId } },
      create: { shop: session.shop, productId, videoUrl },
      update: { videoUrl },
    });
  }

  return null;
};

export default function Videos() {
  const { videos, mappings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [productId, setProductId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [modalActive, setModalActive] = useState(false);

  const handleVideoClick = useCallback((video: any) => {
    setSelectedVideo(video);
    setModalActive(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalActive(false);
    setSelectedVideo(null);
  }, []);

  const rows = videos.map((video) => [
    video.customerEmail,
    `${video.customerFirstName} ${video.customerLastName}`,
    video.productId,
    <Badge status={video.status === 'completed' ? 'success' : video.status === 'failed' ? 'critical' : 'warning'}>
      {video.status}
    </Badge>,
    video.videoUrl ? (
      <Button size="slim" onClick={() => window.open(video.videoUrl, '_blank')}>
        View Video
      </Button>
    ) : 'Not ready',
    <Button size="slim" onClick={() => handleVideoClick(video)}>
      Details
    </Button>,
  ]);

  return (
    <Page>
      <TitleBar title="Video Management" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Product Video Mappings</Text>
                <Form onSubmit={() => {
                  const form = new FormData();
                  form.append("action", "upsert_mapping");
                  form.append("productId", productId);
                  form.append("videoUrl", videoUrl);
                  fetcher.submit(form, { method: "post" });
                }}>
                  <FormLayout>
                    <TextField label="Product ID" value={productId} onChange={setProductId} placeholder="e.g. 1234567890" />
                    <TextField label="Video URL" value={videoUrl} onChange={setVideoUrl} placeholder="https://.../video.mp4" />
                    <Button submit primary>Save Mapping</Button>
                  </FormLayout>
                </Form>
                <DataTable
                  columnContentTypes={["text","text"]}
                  headings={["Product ID","Video URL"]}
                  rows={(mappings || []).map((m:any)=>[m.productId, m.videoUrl])}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Customer Videos
                </Text>
                <Text variant="bodyMd" as="p">
                  Manage and view all personalized videos generated for your customers.
                </Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                  headings={['Email', 'Customer', 'Product ID', 'Status', 'Video', 'Actions']}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title="Video Details"
        primaryAction={{
          content: 'Close',
          onAction: handleModalClose,
        }}
      >
        <Modal.Section>
          {selectedVideo && (
            <FormLayout>
              <TextField
                label="Customer Email"
                value={selectedVideo.customerEmail}
                readOnly
              />
              <TextField
                label="Customer Name"
                value={`${selectedVideo.customerFirstName} ${selectedVideo.customerLastName}`}
                readOnly
              />
              <TextField
                label="Product ID"
                value={selectedVideo.productId}
                readOnly
              />
              <TextField
                label="Order ID"
                value={selectedVideo.orderId}
                readOnly
              />
              <TextField
                label="Status"
                value={selectedVideo.status}
                readOnly
              />
              {selectedVideo.videoUrl && (
                <TextField
                  label="Video URL"
                  value={selectedVideo.videoUrl}
                  readOnly
                />
              )}
              <TextField
                label="Created At"
                value={selectedVideo.createdAt ? new Date(selectedVideo.createdAt).toLocaleString() : 'N/A'}
                readOnly
              />
            </FormLayout>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}

