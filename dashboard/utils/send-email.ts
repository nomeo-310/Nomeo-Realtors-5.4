import nodemailer from 'nodemailer';

interface sendEmailOptions {
  email: string;
  subject: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options:sendEmailOptions) => {

  const emailOption = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(emailOption);
}

