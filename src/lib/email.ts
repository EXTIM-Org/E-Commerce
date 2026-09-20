import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  // If SMTP is not configured, we mock the email sending for development
  if (!SMTP_HOST) {
    console.log("\n==================================================");
    console.log("📧 [MOCK EMAIL] - SMTP not configured.");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body: (HTML Content omitted for brevity)");
    
    // Extract and print links so they can be clicked in the terminal during development
    const links = html.match(/href="([^"]+)"/g)?.map(h => h.replace(/href="|"/g, '')) || [];
    if (links.length > 0) {
      console.log("Extracted Links:");
      links.forEach(link => console.log(`- ${link}`));
    }
    
    console.log("==================================================\n");
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM || "Extim Store <noreply@yourdomain.com>",
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
