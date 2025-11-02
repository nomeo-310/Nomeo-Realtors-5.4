import nodemailer from 'nodemailer';

interface sendEmailOptions {
  email: string;
  subject: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_SERVER_USERNAME,
    pass: process.env.SMTP_SERVER_PASSWORD,
  },
});

export const sendMessage = async (options:sendEmailOptions) => {

  const emailOption = {
    from: options.email,
    to: process.env.SITE_MAIL_RECIEVER,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(emailOption);
}