import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

  return { videos };
};

export default function Videos() {
  const { videos } = useLoaderData<typeof loader>();
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

