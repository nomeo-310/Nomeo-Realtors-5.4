'use client';

import React, { useState, useEffect } from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDeletionReminderModal } from "@/hooks/general-store";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import { sendDeletionReminderEmail } from "@/actions/admin-actions";
import { ClockIcon, CalendarIcon, Mail01Icon, User03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertTriangleIcon } from "lucide-react";
import { calculateDeletionStatus } from "@/utils/account-deletion-utils";
import ScrollableWrapper from "../ui/scrollable-wrapper";

interface DeletionReminderModalProps {
  deletionDate?: string;
  gracePeriodDays?: number;
}

const DeletionReminderModal = ({ deletionDate: propDeletionDate, gracePeriodDays: propGracePeriodDays }: DeletionReminderModalProps) => {
  const { onClose, isOpen, user, deletionDate: storeDeletionDate, gracePeriodDays: storeGracePeriodDays } = useDeletionReminderModal();
  
  const deletionDate = propDeletionDate || storeDeletionDate;
  const gracePeriodDays = propGracePeriodDays || storeGracePeriodDays || 30;

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [reminderType, setReminderType] = useState("gentle");
  const [includeRecoveryLink, setIncludeRecoveryLink] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (deletionDate) {
      const status = calculateDeletionStatus(deletionDate);
      setDaysRemaining(status.remainingDays);
      const urgent = status.remainingDays <= 3;
      setIsUrgent(urgent);
    }
  }, [deletionDate]);

  // Deletion reminder templates
  const deletionReminderTemplates = [
    {
      id: 'gentle_reminder',
      title: 'Gentle Deletion Reminder',
      subject: 'Action Required: Your Account Deletion is Scheduled',
      message: `Dear {userName},

We wanted to gently remind you that your account deletion is scheduled for {deletionDate}. You still have {daysRemaining} days remaining in your grace period to recover your account.

Your account was marked for deletion on {initiationDate}. If this was a mistake or if you've changed your mind, you can still recover your account before it's permanently deleted.

To recover your account, please visit your account settings or click the recovery link below.

If you have any questions or need assistance, our support team is here to help.

Best regards,
The Account Security Team`
    },
    {
      id: 'urgent_reminder',
      title: 'Urgent Final Reminder',
      subject: 'URGENT: Account Deletion in {daysRemaining} Days - Final Warning',
      message: `URGENT NOTICE {userName}!

Your account is scheduled for permanent deletion in {daysRemaining} days (on {deletionDate}). This is your FINAL reminder.

Once deleted:
• All your data will be permanently removed
• Account cannot be recovered
• All settings and preferences lost
• Access to services terminated

This action is irreversible. If you wish to keep your account, you must take immediate action.

TIME-SENSITIVE: Click the recovery link below to cancel deletion before it's too late.

Contact support immediately if you need help.

Sincerely,
The Security Operations Team`
    },
    {
      id: 'welcome_back',
      title: 'Welcome Back Reminder',
      subject: 'We Miss You! Your Account is About to be Deleted',
      message: `Hi {userName},

We noticed you initiated account deletion on {initiationDate}. Your account is scheduled to be permanently deleted on {deletionDate}.

We'd love to have you stay with us! If you've changed your mind or if this was unintentional, you still have {daysRemaining} days to recover your account.

To welcome you back:
1. Recover your account using the link below
2. We'll restore all your data immediately
3. Get back to enjoying our services

We're here if you need anything at all!

Warm regards,
The Community Team`
    },
    {
      id: 'data_preservation',
      title: 'Data Preservation Reminder',
      subject: 'Important: Preserve Your Data Before Deletion',
      message: `Dear {userName},

Your account is scheduled for deletion on {deletionDate}. We want to ensure you have everything you need before this happens.

Important information:
• Deletion Date: {deletionDate}
• Days Remaining: {daysRemaining}
• Data Recovery: Available until deletion date

Before your account is deleted, consider:
1. Exporting your data and files
2. Saving important messages and contacts
3. Downloading your activity history
4. Reviewing any pending transactions

To cancel deletion or download your data, please visit your account dashboard.

We're available 24/7 to help with data exports.

Respectfully,
The Data Protection Team`
    }
  ];

  // Reminder types based on urgency
  const reminderTypes = [
    { 
      label: 'Gentle Reminder', 
      value: 'gentle',
      description: 'Friendly reminder with recovery options'
    },
    { 
      label: 'Urgent Warning', 
      value: 'urgent',
      description: 'Final warning for immediate action'
    },
    { 
      label: 'Welcome Back', 
      value: 'welcome_back',
      description: 'Encouraging message to reconsider'
    },
    { 
      label: 'Data Preservation', 
      value: 'data_preservation',
      description: 'Focus on data backup and recovery'
    }
  ];

  // Initialize form - depends on daysRemaining
  useEffect(() => {
    if (user && deletionDate && daysRemaining > 0) {
      // Determine appropriate template based on urgency
      let defaultTemplateId = 'gentle_reminder';
      let defaultReminderType = 'gentle';
      
      if (isUrgent) {
        defaultTemplateId = 'urgent_reminder';
        defaultReminderType = 'urgent';
      } else if (daysRemaining <= 7) {
        defaultTemplateId = 'data_preservation';
        defaultReminderType = 'data_preservation';
      } else {
        defaultTemplateId = 'gentle_reminder';
        defaultReminderType = 'gentle';
      }

      setSelectedTemplate(defaultTemplateId);
      setReminderType(defaultReminderType);
      setIncludeRecoveryLink(true);
      setShowPreview(false);

      const defaultTemplate = deletionReminderTemplates.find(t => t.id === defaultTemplateId);
      if (defaultTemplate) {
        const processed = processTemplate(defaultTemplate);
        setCustomSubject(processed.subject);
        setCustomMessage(processed.message);
      }
    }
  }, [user, deletionDate, daysRemaining, isUrgent]);

  const processTemplate = (template: any) => {
    let processedSubject = template.subject;
    let processedMessage = template.message;

    const today = new Date();
    const deletionDateObj = new Date(deletionDate || '');
    
    // Calculate initiation date (30 days before deletion)
    const initiationDate = new Date(deletionDateObj);
    initiationDate.setDate(initiationDate.getDate() - gracePeriodDays);
    
    const placeholders: Record<string, string> = {
      '{userName}': `${user?.surName || ''} ${user?.lastName || ''}`.trim() || `${user?.userType === 'agent' ? 'Agent' : 'User'}`,
      '{userType}': user?.userType || 'user',
      '{initiationDate}': formatDate(initiationDate.toISOString()) || "",
      '{deletionDate}': formatDate(deletionDate || '') || "",
      '{daysRemaining}': daysRemaining.toString(),
      '{gracePeriod}': gracePeriodDays.toString(),
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      processedSubject = processedSubject.replace(new RegExp(key, 'g'), value);
      processedMessage = processedMessage.replace(new RegExp(key, 'g'), value);
    });

    return { subject: processedSubject, message: processedMessage };
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = deletionReminderTemplates.find(t => t.id === templateId);
    if (template) {
      const processed = processTemplate(template);
      setCustomSubject(processed.subject);
      setCustomMessage(processed.message);
    }
  };

  const handleReminderTypeChange = (type: string) => {
    setReminderType(type);
    const typeToTemplate: Record<string, string> = {
      'gentle': 'gentle_reminder',
      'urgent': 'urgent_reminder',
      'welcome_back': 'welcome_reminder',
      'data_preservation': 'data_preservation'
    };

    const templateId = typeToTemplate[type];
    if (templateId) {
      handleTemplateChange(templateId);
    }
  };

  const handleSendReminder = async () => {
    if (!user?.email) {
      toast.error('No user email available');
      return;
    }

    setIsSending(true);

    try {
      const userName = `${user.surName || ''} ${user.lastName || ''}`.trim() || `${user.userType === 'agent' ? 'Agent' : 'User'}`;

      const result = await sendDeletionReminderEmail({
        to: user.email,
        subject: customSubject,
        message: customMessage,
        userName: userName,
        userType: user.userType || 'user',
        includeRecoveryLink: includeRecoveryLink,
        deletionDate: deletionDate || '',
        daysRemaining: daysRemaining,
        isUrgent: isUrgent
      });

      if (result.success) {
        toast.success('Deletion reminder sent successfully!', {
          description: `Reminder sent to ${user.email}`
        });

        onClose();
        resetForm();
      } else {
        toast.error(result.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending deletion reminder:', error);
      toast.error('An error occurred while sending the reminder');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setCustomSubject("");
    setCustomMessage("");
    setReminderType("gentle");
    setIncludeRecoveryLink(true);
    setShowPreview(false);
    setIsSending(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!user || !deletionDate) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim() || (user.userType === 'agent' ? 'Agent' : 'User');
  const userTypeLabel = user.userType === 'agent' ? 'Agent' : 'User';
  const registrationDate = user.registrationDate ? formatDate(user.registrationDate) : 'Unknown';
  const deletionDateFormatted = formatDate(deletionDate);

  const currentSubject = customSubject;
  const currentMessage = customMessage;

  // Get urgency badge color
  const getUrgencyColor = () => {
    if (daysRemaining <= 1) return 'bg-red-100 text-red-800 border-red-300';
    if (daysRemaining <= 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={'Send Deletion Reminder'}
      width="lg:w-[750px] xl:w-[800px] md:w-[650px]"
      useCloseButton
      useSeparator
    >
      <ScrollableWrapper>
        <div className="space-y-4 p-1">
          {showPreview ? (
            <div className="space-y-4">
              {/* Preview Header */}
              <div className={`p-4 rounded-xl border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Message Preview</h4>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getUrgencyColor()} border`}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-gray-500" />
                    <p><span className="font-medium">To:</span> {displayName} &lt;{user.email}&gt;</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4 text-gray-500" />
                    <p><span className="font-medium">Subject:</span> {currentSubject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CalendarIcon} className="w-4 h-4 text-gray-500" />
                    <p><span className="font-medium">Deletion Date:</span> {deletionDateFormatted}</p>
                  </div>
                  {isUrgent && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                      <p className="text-xs font-medium text-red-800 flex items-center gap-1">
                        <AlertTriangleIcon className="w-3 h-3" />
                        URGENT REMINDER: User has only {daysRemaining} days left
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Preview */}
              <div className="border rounded-xl p-4 bg-white">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {currentMessage}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Edit
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={isSending}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reminder...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Deletion Reminder
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Information Card */}
              <div className={`p-4 rounded-xl ${isUrgent ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <HugeiconsIcon icon={User03Icon} className="w-5 h-5" />
                      {userTypeLabel}: {displayName}
                      <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${userTypeLabel === 'Agent' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {userTypeLabel}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  </div>
                  <div className={`px-3 py-2 rounded-lg flex items-center gap-3 ${isUrgent ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-300'}`}>
                    <div className="text-xs font-medium text-gray-600">Days Remaining:</div>
                    <div className={`text-2xl font-bold ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
                      {daysRemaining}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CalendarIcon} className="w-4 h-4 text-gray-500" />
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-600">Deletion Date: </div>
                      <div className="font-semibold text-gray-900">{deletionDateFormatted}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={ClockIcon} className="w-4 h-4 text-gray-500" />
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-600">Grace Period</div>
                      <div className="font-semibold text-gray-900">{gracePeriodDays} days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CalendarIcon} className="w-4 h-4 text-gray-500" />
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-600">Registered</div>
                      <div className="font-semibold text-gray-900">{registrationDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4 text-gray-500" />
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-600">Status</div>
                      <div className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                        {isUrgent ? 'URGENT' : 'Scheduled for Deletion'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {isUrgent && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-800">Urgent Attention Required</p>
                        <p className="text-sm text-red-700">
                          This user has only {daysRemaining} days left before permanent deletion.
                          Consider using the "Urgent Warning" template for maximum impact.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* Replace the entire grid section with this: */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminder Type - Fixed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-type" className="text-sm font-semibold text-gray-900">
                    Reminder Tone
                  </Label>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hidden lg:inline-block">
                    {reminderTypes.find(t => t.value === reminderType)?.description}
                  </span>
                </div>
                <CustomSelect
                  placeholder="Select reminder tone..."
                  options={reminderTypes}
                  value={reminderType}
                  onChange={handleReminderTypeChange}
                  style={`w-full border ${isUrgent ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  height="h-10"
                  placeholderStyle="text-sm"
                  itemText="text-sm"
                />
              </div>

                {/* Template Selection - Fixed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder-template" className="text-sm font-semibold text-gray-900">
                      Message Template
                    </Label>
                    {/* Empty div to maintain alignment */}
                    <div className="hidden lg:block h-6"></div>
                  </div>
                  <CustomSelect
                    placeholder="Select message template..."
                    options={deletionReminderTemplates.map(template => ({
                      label: template.title,
                      value: template.id
                    }))}
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    style={`w-full border ${isUrgent ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    height="h-10"
                    placeholderStyle="text-sm"
                    itemText="text-sm"
                  />
                </div>
              </div>

              {/* Custom Subject */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-subject" className="text-sm font-semibold text-gray-900">
                    Email Subject
                  </Label>
                  <span className="text-xs text-gray-500">{customSubject.length}/100 characters</span>
                </div>
                <input
                  id="custom-subject"
                  type="text"
                  placeholder="Enter email subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value.slice(0, 100))}
                  className={`w-full p-3 border ${isUrgent ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-0 outline-none focus:outline-none focus:border-blue-500`}
                  maxLength={100}
                />
              </div>

              {/* Custom Message */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-message" className="text-sm font-semibold text-gray-900">
                    Message Content
                  </Label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      {customMessage.length}/2000 characters
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const template = deletionReminderTemplates.find(t => t.id === selectedTemplate);
                        if (template) {
                          const processed = processTemplate(template);
                          setCustomSubject(processed.subject);
                          setCustomMessage(processed.message);
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Reset to Template
                    </button>
                  </div>
                </div>
                <Textarea
                  id="custom-message"
                  placeholder="Customize your deletion reminder message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value.slice(0, 2000))}
                  rows={8}
                  className={`text-sm resize-none border ${isUrgent ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                  maxLength={2000}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(true)}
                    disabled={!customSubject.trim() || !customMessage.trim()}
                    className="px-4 py-2.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview Message
                  </button>
                  <button
                    onClick={handleSendReminder}
                    disabled={!customSubject.trim() || !customMessage.trim() || isSending}
                    className={`px-4 py-2.5 text-white rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md ${
                      isUrgent 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {isUrgent ? 'Send Urgent Reminder' : 'Send Reminder'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollableWrapper>
    </Modal>
  );
};

export default DeletionReminderModal;