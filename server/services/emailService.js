import nodemailer from 'nodemailer';
export async function sendEmail({ to, subject, html, attachments }){
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST) throw new Error('SMTP not configured');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject, html, attachments });
}
