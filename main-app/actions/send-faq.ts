'use server'

import { ContactEmailTemplate } from "@/components/email-templates/contact-email-template";
import { faqMessageValues } from "@/lib/form-validations"
import { sendMessage } from "@/lib/send-message";
import { render } from "@react-email/components";

export const sendFaq = async (value:faqMessageValues) => {
  const { message, name, email } = value;
  try {
    const emailTemplate = await render(
      ContactEmailTemplate(
        { name: name,
          email: email,
          message: message
        })
    );

    const sendOption = {
      email: email, 
      subject: 'Reachouts From Customers', 
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