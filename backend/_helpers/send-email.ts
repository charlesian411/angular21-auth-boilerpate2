import nodemailer from 'nodemailer';
let config: any;
try {
    config = require('../config.json');
} catch (e) {
    config = {
        emailFrom: process.env.EMAIL_FROM,
        smtpOptions: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
    };
}

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  const transporter = nodemailer.createTransport(config.smtpOptions);
  await transporter.sendMail({ from, to, subject, html });
}