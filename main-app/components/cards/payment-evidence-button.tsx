'use client'

import { Attachment01Icon, MailSend01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { toast } from "sonner";


const PaymentEvidenceButton = ({ propertyId, className, user}:{propertyId:string, className?:string, user: string}) => {
  const [showFallback, setShowFallback] =   React.useState(false);

  const handleSendEvidence = () => {
    const subject = 'Payment Evidence';
    const body = `Dear Support Team,

I have made the payment for my transaction.
Please find the evidence attached.

Transaction Details:
- Property ID: ${propertyId}
- Date: ${new Date().toLocaleDateString()}

Thank you.

${user}`;

    const mailtoLink = `mailto:support@nomeorealtorsinc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Try to open email client
    const mailWindow = window.open(mailtoLink, '_blank');
    
    if (!mailWindow) {
      setShowFallback(true);
      return;
    }

    // Check if mail client didn't open properly
    setTimeout(() => {
      if (mailWindow.closed || mailWindow.document.URL === 'about:blank') {
        setShowFallback(true);
      }
    }, 1000);
  };

  const copyToClipboard = async () => {
    const text = 'support@yourcompany.com';
    try {
      await navigator.clipboard.writeText(text);
      toast.info('Support email copied to clipboard! Please send your payment evidence to this address.');
      setShowFallback(false);
    } catch (err) {
      toast.error('Please email your payment evidence to: support@nomeorealtorsinc.com');
    }
  };

  return (
    <>
      <button 
        onClick={handleSendEvidence}
        className={`text-black/60 w-full mt-2 flex gap-2 justify-end items-center text-sm lg:text-base dark:text-white/70 ${className}`}
      >
        Send evidence
        <HugeiconsIcon icon={MailSend01Icon} className="size-5" />
      </button>

      {showFallback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Email Client Not Found</h3>
            <p className="mb-4">Please use one of these options to send your payment evidence:</p>
            <div className="space-y-2">
              <button 
                onClick={copyToClipboard}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Copy Support Email to Clipboard
              </button>
              <button 
                onClick={() => setShowFallback(false)}
                className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentEvidenceButton;