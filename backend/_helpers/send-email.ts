import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const config: any = {
    emailFrom: process.env.EMAIL_FROM,
    sendgridApiKey: process.env.SENDGRID_API_KEY
};

// Initialize SendGrid if API Key is present
if (config.sendgridApiKey) {
    sgMail.setApiKey(config.sendgridApiKey);
}

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  console.log(`Attempting to send email to: ${to}`);
  
  // OPTION A: USE SENDGRID HTTPS API (SDK)
  if (config.sendgridApiKey) {
      try {
          await sgMail.send({
              to: to,
              from: from,
              subject: subject,
              html: html
          });
          console.log('✅ EMAIL DELIVERED SUCCESSFULLY via SendGrid HTTPS SDK');
          return;
      } catch (error: any) {
          console.error('❌ SENDGRID SDK ERROR:', error.response?.body || error.message);
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