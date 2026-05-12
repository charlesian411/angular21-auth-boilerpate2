import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const config: any = {
    emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    resendApiKey: process.env.RESEND_API_KEY
};

let resend: Resend | null = null;
if (config.resendApiKey) {
    resend = new Resend(config.resendApiKey);
}

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  console.log(`Attempting to send email to: ${to}`);
  
  // OPTION A: USE RESEND HTTPS API (Most reliable for Vercel)
  if (resend) {
      try {
          await resend.emails.send({
              from: from,
              to: to,
              subject: subject,
              html: html
          });
          console.log('✅ EMAIL DELIVERED SUCCESSFULLY via Resend HTTPS API');
          return;
      } catch (error: any) {
          console.error('❌ RESEND API ERROR:', error.message);
          // Fallback to SMTP or logging below...
      }
  }

  // OPTION B: FALLBACK TO SMTP (Ethereal)
  try {
    const smtpOptions = {
        host: process.env.SMTP_HOST,
        port: 2525,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    };
    const transporter = nodemailer.createTransport(smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
    console.log('✅ EMAIL DELIVERED SUCCESSFULLY via SMTP Fallback');
  } catch (error: any) {
    console.error('❌ ALL EMAIL METHODS FAILED:', error.message);
    console.log('Verification Link Content (Check Logs!):', html);
  }
}