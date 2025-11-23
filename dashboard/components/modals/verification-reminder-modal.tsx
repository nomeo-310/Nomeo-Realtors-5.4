// components/admin/verification-reminder-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVerificationReminderModal } from "@/hooks/general-store";
import { formatDate } from "@/utils/formatDate";

const VerificationReminderModal = () => {
  const { onClose, isOpen, user } = useVerificationReminderModal();

  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [customSubject, setCustomSubject] = React.useState("");
  const [customMessage, setCustomMessage] = React.useState("");
  const [reminderType, setReminderType] = React.useState("friendly");
  const [includeVerificationLink, setIncludeVerificationLink] = React.useState(true);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reminder templates
  const reminderTemplates = [
    {
      id: 'friendly_reminder',
      title: 'Friendly Verification Reminder',
      subject: 'Complete Your Verification - Action Required',
      message: `Dear {userName},

We noticed you haven't completed your account verification yet. Verifying your account helps us ensure the security of our platform and unlocks all features available to you.

To complete your verification, please visit your account settings or use the verification link below.

If you need any assistance with the verification process, please don't hesitate to contact our support team.

Welcome to our community!

Best regards,
The Team`
    },
    {
      id: 'urgent_reminder',
      title: 'Urgent Verification Required',
      subject: 'URGENT: Account Verification Required to Continue',
      message: `Dear {userName},

Your account verification is required to maintain full access to our platform. Without verification, your account features will remain limited.

This is a final reminder to complete your verification. Please take a moment to verify your account to avoid any interruptions in service.

Verification is quick and easy - it helps us maintain a secure environment for all users.

Sincerely,
The Security Team`
    },
    {
      id: 'welcome_reminder',
      title: 'Welcome & Verification Reminder',
      subject: 'Welcome! Complete Your Verification to Get Started',
      message: `Welcome {userName}!

Thank you for joining our platform. We're excited to have you on board!

To get started and access all features, please complete your account verification. This quick process helps us ensure the security of our community.

Once verified, you'll be able to:
- Access all platform features
- Connect with other users
- Enjoy full account capabilities

We're here to help if you encounter any issues!

Best regards,
The Welcome Team`
    },
    {
      id: 'feature_reminder',
      title: 'Feature Access Reminder',
      subject: 'Unlock Full Features - Verify Your Account',
      message: `Hi {userName},

You're missing out! Complete your account verification to unlock all the amazing features our platform has to offer.

Currently limited:
- Full messaging capabilities
- Advanced search filters
- Premium content access
- Complete profile visibility

Verification takes just 2 minutes and ensures a secure experience for everyone.

Get verified now and start enjoying everything we have to offer!

Cheers,
The Platform Team`
    }
  ];

  // Reminder types
  const reminderTypes = [
    { label: 'Friendly Reminder', value: 'friendly' },
    { label: 'Urgent Reminder', value: 'urgent' },
    { label: 'Welcome Reminder', value: 'welcome' },
    { label: 'Feature Reminder', value: 'feature' }
  ];

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setSelectedTemplate('friendly_reminder');
      setReminderType('friendly');
      setIncludeVerificationLink(true);
      setShowPreview(false);

      // Pre-fill with default template
      const defaultTemplate = reminderTemplates.find(t => t.id === 'friendly_reminder');
      if (defaultTemplate) {
        const processed = processTemplate(defaultTemplate);
        setCustomSubject(processed.subject);
        setCustomMessage(processed.message);
      }
    }
  }, [user]);

  const processTemplate = (template: any) => {
    let processedSubject = template.subject;
    let processedMessage = template.message;

    const placeholders: Record<string, string> = {
      '{userName}': `${user?.surName || ''} ${user?.lastName || ''}`.trim() || 'Valued User',
      '{userType}': user?.userType || 'user',
      '{registrationDate}': user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'recently',
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      processedSubject = processedSubject.replace(new RegExp(key, 'g'), value);
      processedMessage = processedMessage.replace(new RegExp(key, 'g'), value);
    });

    return { subject: processedSubject, message: processedMessage };
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reminderTemplates.find(t => t.id === templateId);
    if (template) {
      const processed = processTemplate(template);
      setCustomSubject(processed.subject);
      setCustomMessage(processed.message);
    }
  };

  const handleReminderTypeChange = (type: string) => {
    setReminderType(type);
    // Map reminder type to template
    const typeToTemplate: Record<string, string> = {
      'friendly': 'friendly_reminder',
      'urgent': 'urgent_reminder',
      'welcome': 'welcome_reminder',
      'feature': 'feature_reminder'
    };

    const templateId = typeToTemplate[type];
    if (templateId) {
      handleTemplateChange(templateId);
    }
  };

  const handleIncludeLinkChange = (checked: boolean) => {
    setIncludeVerificationLink(checked);
    // Re-process current message with updated link
    if (selectedTemplate) {
      const template = reminderTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        const processed = processTemplate(template);
        setCustomMessage(processed.message);
      }
    }
  };

  const getMailtoLink = () => {
    const finalMessage = includeVerificationLink
      ? `${customMessage}\n\nVerification Link: https://yourapp.com/verify-account`
      : customMessage;

    return `mailto:${user?.email}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(finalMessage)}`;
  };

  const handleSendReminder = () => {
    const mailtoLink = getMailtoLink();
    window.open(mailtoLink, "_blank");

    // Optional: Log the reminder in your system
    console.log('Reminder sent:', {
      userId: user?.id,
      template: selectedTemplate,
      type: reminderType,
      includeLink: includeVerificationLink
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setCustomSubject("");
    setCustomMessage("");
    setReminderType("friendly");
    setIncludeVerificationLink(true);
    setShowPreview(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const userTypeLabel = user.userType;
  const registrationDate = user.registrationDate ? formatDate(user.registrationDate)  : 'Unknown';

  const currentSubject = customSubject;
  const currentMessage = customMessage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Verification Reminder"
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
      useCloseButton
      useSeparator
    >
      <div className="space-y-4">
        {showPreview ? (
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Message Preview</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">To:</span> {displayName} &lt;{user.email}&gt;</p>
                <p><span className="font-medium">Subject:</span> {currentSubject}</p>
              </div>
            </div>

            {/* Message Preview */}
            <div className="border rounded-lg p-4 bg-white">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                {currentMessage}
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
                onClick={handleSendReminder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Open in Email Client
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Unverified User</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span>{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">User Type:</span>
                  <span className="capitalize font-semibold text-blue-600">{userTypeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Registered:</span>
                  <span>{registrationDate}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Reminder Type */}
              <div className="space-y-3">
                <Label htmlFor="reminder-type" className="text-sm font-semibold text-gray-900">
                  Reminder Type
                </Label>
                <CustomSelect
                  placeholder="Select reminder type..."
                  options={reminderTypes}
                  value={reminderType}
                  onChange={handleReminderTypeChange}
                  style="border-gray-300 rounded-md"
                  height="h-10"
                  placeholderStyle="lg:text-sm text-sm"
                  itemText="lg:text-sm text-sm"
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-3">
                <Label htmlFor="reminder-template" className="text-sm font-semibold text-gray-900">
                  Message Template
                </Label>
                <CustomSelect
                  placeholder="Select message template..."
                  options={reminderTemplates.map(template => ({
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
              </div>
            </div>

            {/* Custom Subject */}
            <div className="space-y-3">
              <Label htmlFor="custom-subject" className="text-sm font-semibold text-gray-900">
                Email Subject
              </Label>
              <input
                id="custom-subject"
                type="text"
                placeholder="Enter email subject..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-0 outline-none focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Custom Message */}
            <div className="space-y-3">
              <Label htmlFor="custom-message" className="text-sm font-semibold text-gray-900">
                Message Content
              </Label>
              <Textarea
                id="custom-message"
                placeholder="Customize your verification reminder message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="resize-none"
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
                  disabled={!customSubject.trim() || !customMessage.trim()}
                  className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Message
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={!customSubject.trim() || !customMessage.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VerificationReminderModal;