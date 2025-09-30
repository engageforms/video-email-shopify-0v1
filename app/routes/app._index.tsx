import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Box,
  InlineStack,
  Badge,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get recent customer video data
  const recentVideos = await db.customerVideoData.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Get statistics
  const totalVideos = await db.customerVideoData.count({
    where: { shop: session.shop },
  });

  const completedVideos = await db.customerVideoData.count({
    where: { 
      shop: session.shop,
      status: 'completed'
    },
  });

  const pendingVideos = await db.customerVideoData.count({
    where: { 
      shop: session.shop,
      status: 'pending_video_generation'
    },
  });

  return {
    recentVideos,
    stats: {
      total: totalVideos,
      completed: completedVideos,
      pending: pendingVideos,
    }
  };
};

export default function Index() {
  const { recentVideos, stats } = useLoaderData<typeof loader>();

  const rows = recentVideos.map((video) => [
    video.customerEmail,
    video.customerFirstName + ' ' + video.customerLastName,
    video.productId,
    <Badge status={video.status === 'completed' ? 'success' : 'warning'}>
      {video.status}
    </Badge>,
    video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A',
  ]);

  return (
    <Page>
      <TitleBar title="Video Personalization Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Video Personalization Overview
                </Text>
                <Text variant="bodyMd" as="p">
                  Welcome to your video personalization app! This dashboard shows you the status of personalized videos being generated for your customers.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Statistics
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Total Videos
                      </Text>
                      <Text as="span" variant="headingMd">
                        {stats.total}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Completed
                      </Text>
                      <Text as="span" variant="headingMd">
                        {stats.completed}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Pending
                      </Text>
                      <Text as="span" variant="headingMd">
                        {stats.pending}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Recent Video Requests
                </Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Email', 'Customer', 'Product ID', 'Status', 'Created']}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
