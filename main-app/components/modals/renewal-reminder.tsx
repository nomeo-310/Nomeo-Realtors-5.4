"use client";

import React from "react";
import Modal from "../ui/modal";
import { useRenewalReminderModal } from "@/hooks/general-store";
import { formatDate, nairaSign } from "@/lib/utils";
import CustomSelect from "../ui/custom-select";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface ReminderTemplate {
  subject: string;
  body: string;
}

const RenewalReminder = () => {
  const { onClose, isOpen, details, isOverdue, overdueDays } = useRenewalReminderModal();

  console.log(isOverdue);
  console.log(overdueDays)

  const [reminderType, setReminderType] = React.useState<'Gentle' | 'Urgent' | 'Final'>('Gentle');
  const [customMessage, setCustomMessage] = React.useState<string>('');

  const [showPreview, setShowPreview] = React.useState(false);

  const reminderTemplates: Record<'Gentle' | 'Urgent' | 'Final', ReminderTemplate> = {
    Gentle: {
      subject: `Friendly Rent Reminder - ${details?.property.address}`,
      body: `Hello ${details?.user.surName} ${details?.user.lastName},

I hope this message finds you well. This is a friendly reminder that the rent for ${details?.property.address}is due on ${formatDate(details?.nextDueDate || "")}.

Rent Amount: ${nairaSign}${details?.property.annualRent.toLocaleString()}

Please remember to submit your payment by the due date to avoid any late fees. If you've already made the payment, please disregard this message.

Thank you for your prompt attention to this matter.

Best regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    Urgent: {
      subject: `URGENT: Rent Payment Overdue - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

This is an urgent reminder that your rent payment for  ${details?.property.address} is now overdue.

Rent Amount: ${nairaSign}${details?.property.annualRent.toLocaleString()}
Due Date: ${formatDate(details?.nextDueDate || "")}
${(isOverdue && overdueDays) ? `Days Overdue: ${overdueDays} days` : ''}

Please make the payment immediately to avoid additional late fees or further action. If you've already paid, please contact me with the payment details.

Sincerely,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    Final: {
      subject: `FINAL NOTICE: Rent Payment Required - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

This is a final notice regarding your overdue rent payment for ${details?.property.address}.

Rent Amount: ${nairaSign}${details?.property.annualRent.toLocaleString()}
Original Due Date: ${formatDate(details?.nextDueDate || "")}
${(isOverdue && overdueDays) ? `Days Overdue: ${overdueDays} days` : ''}
${(isOverdue && overdueDays) ? `Late Fees: ${((details?.property.annualRent || 0) / 365) * overdueDays} days` : ''}

Failure to make immediate payment may result in further action as outlined in your lease agreement. Please contact me urgently to discuss this matter.

Regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    }
  };

  const handleSendReminder = (): void => {
    const template = reminderTemplates[reminderType];
    const finalBody = customMessage 
      ? `${template.body}\n\nAdditional Note: ${customMessage}`
      : template.body;

    const mailtoLink = `mailto:${details?.user.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(finalBody)}`;
    window.open(mailtoLink, '_blank');
    onClose();
    setCustomMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setCustomMessage('');
        setShowPreview(false);
        setReminderType('Gentle')
      }}
      title="Send Rent Reminder"
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
      useCloseButton
    >
      <div className="space-y-4">
        {showPreview ?
          <React.Fragment>
            <button className="flex items-center gap-2 mb-2 bg-gray-100 border py-1.5 pr-3 rounded-md text-sm mt-3" onClick={() =>setShowPreview(false)}>
              <HugeiconsIcon icon={ArrowLeft01Icon}/>
              <h4 className="font-semibold text-gray-900">Back To Editor</h4>
            </button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Message Preview</h4>
              <p className="font-medium">Subject: {reminderTemplates[reminderType].subject}</p>
              <div className="mt-2 bg-gray-100 rounded border p-2">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {reminderTemplates[reminderType].body}
                </pre>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Back to Edit
              </button>
              <button 
                onClick={handleSendReminder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Send Email
              </button>
            </div>
          </React.Fragment> : 
          <React.Fragment>
          <div className="bg-gray-50 p-4 rounded-lg mt-3">
            <h4 className="font-semibold text-gray-900 mb-2">Tenant Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><span className="font-medium">Tenant:</span> {details?.user.surName} {details?.user.lastName}</p>
              <p><span className="font-medium">Email:</span> {details?.user.email}</p>
              <p><span className="font-medium">Property:</span> {details?.property.address}</p>
              <p><span className="font-medium">Current Rent:</span> {nairaSign}{details?.property.annualRent.toLocaleString()}</p>
            </div>
          </div>
            <div className="space-y-2 mt-3">
              <label className="block text-sm font-semibold text-gray-900">Reminder Type</label>
              <CustomSelect
                placeholder="Choose reminder type"
                data={['Gentle', 'Urgent', 'Final']}
                value={reminderType}
                onChange={(value: string) => {
                  if (value === 'Gentle' || value === 'Urgent' || value === 'Final') {
                    setReminderType(value); 
                  } else {
                    console.error(`Invalid reminder type received: ${value}`);
                  }
                }}
                style="border-black/80"
                height="h-10"
              />
            </div>
            <div className="space-y-2 mt-3">
              <label className="block text-sm font-semibold text-gray-900">Additional Message (Optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any personal notes or specific instructions..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md text-sm md:h-24 h-20 resize-none focus:ring-0 outline-none focus:outline-none"
              />
            </div>
            <button 
              type="button" 
              className="flex items-center gap-2 bg-gray-100 border border-gray-300 py-2 px-3 rounded-md text-sm hover:bg-gray-200 transition-colors w-full justify-center"
              onClick={() => setShowPreview(true)}
            >
              <h4 className="font-semibold text-gray-900">Preview Message</h4>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
            </button>
            <div className="flex gap-3 justify-end pt-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendReminder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                Open in Email Client
              </button>
            </div>
          </React.Fragment>
        }
      </div>
    </Modal>
  );
};

export default RenewalReminder;
