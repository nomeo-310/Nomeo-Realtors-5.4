"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { useMessageUserModal } from "@/hooks/general-store";
import { ADMIN_MESSAGE_TEMPLATES, AGENT_MESSAGE_TEMPLATES, USER_MESSAGE_TEMPLATES } from "@/assets/constants/admin-message-templates";

const MessageUserModal = () => {
  const { onClose, isOpen, recipient } = useMessageUserModal();

  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  // Simple sender info - just "Admin"
  const senderName = "Admin";

  // Get appropriate templates based on recipient type
  const getTemplates = () => {
    if (!recipient) return [];
    
    switch (recipient.userType) {
      case 'user':
        return USER_MESSAGE_TEMPLATES;
      case 'agent':
        return AGENT_MESSAGE_TEMPLATES;
      case 'admin':
        return ADMIN_MESSAGE_TEMPLATES;
      default:
        return [];
    }
  };

  const templates = getTemplates();

  // Process template with user data
  const processTemplate = (template: any) => {
    let processedSubject = template.subject;
    let processedBody = template.body;

    const placeholders: Record<string, string> = {
      '{userName}': `${recipient?.surName || ''} ${recipient?.lastName || ''}`.trim() || 'Valued User',
      '{agentName}': `${recipient?.surName || ''} ${recipient?.lastName || ''}`.trim() || 'Valued Agent',
      '{adminName}': `${recipient?.surName || ''} ${recipient?.lastName || ''}`.trim() || 'Valued Admin',
      '{senderName}': senderName,
      '{propertyAddress}': recipient?.propertyAddress || 'your property',
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      processedSubject = processedSubject.replace(new RegExp(key, 'g'), value);
      processedBody = processedBody.replace(new RegExp(key, 'g'), value);
    });

    return { subject: processedSubject, body: processedBody };
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const processed = processTemplate(template);
      setSubject(processed.subject);
      setMessage(processed.body);
    }
  };

  const getMailtoLink = () => {
    const fullSubject = `${isUrgent ? '[URGENT] ' : ''}${subject}`;
    const recipientEmail = recipient?.email;
    
    if (!recipientEmail) {
      alert('No recipient email available');
      return '#';
    }
    
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(message)}`;
  };

  const handleSendMessage = () => {
    const mailtoLink = getMailtoLink();
    if (mailtoLink !== '#') {
      window.open(mailtoLink, "_blank");
    }
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setSelectedTemplate("");
    setIsUrgent(false);
    setShowPreview(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const characterCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  // Don't return null if recipient is missing, just handle gracefully
  const displayName = recipient 
    ? `${recipient.surName || ''} ${recipient.lastName || ''}`.trim() 
    : 'Recipient';

  const displayEmail = recipient?.email || 'No email available';
  const displayType = recipient?.userType || 'user';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      useSeparator
      title={`Message ${displayType.charAt(0).toUpperCase() + displayType.slice(1)}`}
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
      useCloseButton
    >
      <div className="space-y-4">
        {showPreview ? (
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg lg:p-4 p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Message Preview</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">To:</span> {displayName} &lt;{displayEmail}&gt;</p>
                <p><span className="font-medium">Subject:</span> {isUrgent ? '[URGENT] ' : ''}{subject}</p>
                {isUrgent && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    URGENT
                  </span>
                )}
              </div>
            </div>

            {/* Message Preview */}
            <div className="border rounded-lg p-3 lg:p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {message}
              </pre>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Open in Email Client
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient Information */}
            <div className="">
              <h4 className="font-semibold text-gray-900 mb-2">Recipient</h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 lg:p-4 p-3 rounded-lg">
                <p><span className="font-medium">Name:</span> {displayName}</p>
                <p>
                  <span className="font-medium">Current Role:</span>{' '}
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                    {displayType}
                  </span>
                </p>
                <p><span className="font-medium">Email:</span> {displayEmail}</p>
                {recipient?.phoneNumber && (
                  <p><span className="font-medium">Phone:</span> {recipient.phoneNumber}</p>
                )}
                {recipient?.propertyAddress && (
                  <p className="col-span-2">
                    <span className="font-medium">Property:</span> {recipient.propertyAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Quick Templates
              </label>
              <CustomSelect
                placeholder={`Select ${displayType} template...`}
                options={templates.map(template => ({
                  label: template.title,
                  value: template.id
                }))}
                value={selectedTemplate}
                onChange={handleTemplateChange}
                style="border-gray-300 rounded-md"
                height="h-10"
                placeholderStyle="lg:text-sm text-sm"
                itemText="lg:text-sm text-sm"
              />
              <p className="text-xs text-gray-500">
                Select a template to prefill, or write a custom message below
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Enter message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-0 outline-none focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Message
                </label>
                <div className="text-xs text-gray-500">
                  {wordCount} words, {characterCount} characters
                </div>
              </div>
              <textarea
                placeholder={`Type your message to ${displayName}...`}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none focus:ring-0 outline-none focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!subject.trim() || !message.trim() || !recipient?.email}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!subject.trim() || !message.trim() || !recipient?.email}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Open in Email Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MessageUserModal;