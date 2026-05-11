import nodemailer from 'nodemailer';

const config: any = {
    emailFrom: process.env.EMAIL_FROM
};

if (process.env.SENDGRID_API_KEY) {
    config.smtpOptions = {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    };
} else {
    config.smtpOptions = {
        host: process.env.SMTP_HOST,
        port: 2525,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };
}

// Add stability options for Vercel
config.smtpOptions = {
    ...config.smtpOptions,
    debug: true,
    logger: true,
    connectionTimeout: 5000, // Fast timeout
    greetingTimeout: 5000,
    socketTimeout: 5000
};

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  console.log(`Attempting to send email to: ${to}`);
  
  try {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
    console.log('✅ EMAIL DELIVERED SUCCESSFULLY to Ethereal/SMTP');
  } catch (error: any) {
    console.error('❌ EMAIL FAILED TO SEND:', error.message);
    // Log the link anyway so the user can see it in logs
    console.log('Since email failed, here is the content that was supposed to be sent:');
    console.log(html);
  }
}