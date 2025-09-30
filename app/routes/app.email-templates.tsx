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
  TextContainer,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get email templates
  const templates = await db.emailTemplate.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: 'desc' },
  });

  return { templates };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "create") {
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    const isDefault = formData.get("isDefault") === "true";

    // If this is set as default, remove default from others
    if (isDefault) {
      await db.emailTemplate.updateMany({
        where: { shop: session.shop, isDefault: true },
        data: { isDefault: false },
      });
    }

    await db.emailTemplate.create({
      data: {
        shop: session.shop,
        name,
        subject,
        body,
        isDefault,
      },
    });
  } else if (action === "set_default") {
    const templateId = formData.get("templateId") as string;
    
    // Remove default from all templates
    await db.emailTemplate.updateMany({
      where: { shop: session.shop, isDefault: true },
      data: { isDefault: false },
    });

    // Set this template as default
    await db.emailTemplate.update({
      where: { id: templateId },
      data: { isDefault: true },
    });
  }

  return null;
};

export default function EmailTemplates() {
  const { templates } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [modalActive, setModalActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    isDefault: false,
  });

  const handleCreateTemplate = useCallback(() => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      isDefault: false,
    });
    setModalActive(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalActive(false);
    setFormData({
      name: '',
      subject: '',
      body: '',
      isDefault: false,
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const form = new FormData();
    form.append("action", "create");
    form.append("name", formData.name);
    form.append("subject", formData.subject);
    form.append("body", formData.body);
    form.append("isDefault", formData.isDefault.toString());
    
    fetcher.submit(form, { method: "post" });
    handleModalClose();
  }, [formData, fetcher, handleModalClose]);

  const handleSetDefault = useCallback((templateId: string) => {
    const form = new FormData();
    form.append("action", "set_default");
    form.append("templateId", templateId);
    
    fetcher.submit(form, { method: "post" });
  }, [fetcher]);

  const rows = templates.map((template) => [
    template.name,
    template.subject,
    <Badge status={template.isDefault ? 'success' : 'info'}>
      {template.isDefault ? 'Default' : 'Custom'}
    </Badge>,
    template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A',
    <Button 
      size="slim" 
      onClick={() => handleSetDefault(template.id)}
      disabled={template.isDefault}
    >
      {template.isDefault ? 'Default' : 'Set Default'}
    </Button>,
  ]);

  return (
    <Page>
      <TitleBar 
        title="Email Templates"
        primaryAction={{
          content: 'Create Template',
          onAction: handleCreateTemplate,
        }}
      />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Email Templates
                </Text>
                <Text variant="bodyMd" as="p">
                  Manage email templates that will be sent to customers with their personalized videos.
                  Use placeholders like {{customer_first_name}}, {{video_link}}, etc.
                </Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Name', 'Subject', 'Type', 'Created', 'Actions']}
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
        title="Create Email Template"
        primaryAction={{
          content: 'Create',
          onAction: handleSubmit,
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
              label="Template Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="e.g., Welcome Video Email"
            />
            <TextField
              label="Email Subject"
              value={formData.subject}
              onChange={(value) => setFormData({ ...formData, subject: value })}
              placeholder="e.g., Your Personalized Video is Ready!"
            />
            <TextField
              label="Email Body"
              value={formData.body}
              onChange={(value) => setFormData({ ...formData, body: value })}
              multiline={4}
              placeholder="Hi {{customer_first_name}},\n\nYour personalized video is ready! Click the link below to watch:\n\n{{video_link}}\n\nThank you for your purchase!"
            />
            <TextContainer>
              <Text variant="bodyMd" as="p">
                Available placeholders: {{customer_first_name}}, {{customer_last_name}}, {{video_link}}, {{product_id}}
              </Text>
            </TextContainer>
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

