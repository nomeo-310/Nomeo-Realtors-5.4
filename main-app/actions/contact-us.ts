'use server'

import { ContactEmailTemplate } from "@/components/email-templates/contact-email-template";
import { contactValues, faqMessageValues } from "@/lib/form-validations"
import { sendMessage } from "@/lib/send-message";
import { render } from "@react-email/components";

export const contactUs = async (value:contactValues) => {
  const { message, fullName, email, phoneNumber } = value;
  try {
    const emailTemplate = await render(
      ContactEmailTemplate(
        { name: fullName,
          email: email,
          message: message,
          phoneNumber: phoneNumber
        })
    );

    const sendOption = {
      email: email, 
      subject: 'Message From Customers', 
      html: emailTemplate 
    };
  
    try {
      await sendMessage(sendOption);

      return { success: true, message: 'Message sent successfully. Thank you for reaching out', status: 200 }
    } catch (error) {
      console.error(error)
      return { success: false, message: 'Message not sent! Something went wrong', status: 500 }
    };
  } catch (error) {
    return { success: false, message: 'Internal server error, try again later!', status: 500 }
  }
}