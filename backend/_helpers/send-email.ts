import nodemailer from 'nodemailer';
let config: any;
try {
    config = require('../config.json');
} catch (e) {
    config = {};
}

// Override with environment variables
config.emailFrom = process.env.EMAIL_FROM || config.emailFrom;

if (process.env.SENDGRID_API_KEY) {
    // USE SENDGRID SMTP
    config.smtpOptions = {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    };
} else {
    // USE ETHEREAL OR OTHER SMTP
    config.smtpOptions = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465, // Use true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
        },
        timeout: 60000, // Increase timeout to 1 minute
        greetingTimeout: 60000
    };
}

// Add standard production options to smtpOptions
config.smtpOptions = {
    ...config.smtpOptions,
    tls: { rejectUnauthorized: false },
    greetingTimeout: 30000,
    connectionTimeout: 30000,
    debug: true,
    logger: true
};

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  // LOG THE EMAIL CONTENT SO THE USER CAN SEE IT IN RENDER LOGS EVEN IF SMTP FAILS
  console.log('--- EMAIL CONTENT START ---');
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('CONTENT (HTML):');
  console.log(html);
  console.log('--- EMAIL CONTENT END ---');

  const transporter = nodemailer.createTransport(config.smtpOptions);
  await transporter.sendMail({ from, to, subject, html });
}