import nodemailer from "nodemailer";

type RenderTemplateParams = {
  templateBody: string;
  variables: Record<string, string>;
};

export function renderTemplate({ templateBody, variables }: RenderTemplateParams) {
  return templateBody.replace(/{{\s*(\w+)\s*}}/g, (_m, key) => {
    const value = variables[key as keyof typeof variables];
    return (value ?? "").toString();
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD ? {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || "no-reply@example.com",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}


