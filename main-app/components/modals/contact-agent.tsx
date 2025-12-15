"use client";

import React from "react";
import Modal from "../ui/modal";
import { nairaSign } from "@/lib/utils";
import CustomSelect from "../ui/custom-select";
import { ArrowLeft01Icon, ArrowRight01Icon, Edit01Icon, Delete01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useContactAgentModal } from "@/hooks/general-store";

export interface MessageTemplate {
  subject: string;
  body: string;
}

const ContactAgent = () => {
  const { isOpen, onClose, details } = useContactAgentModal();

  const [messageType, setMessageType] = React.useState<'Rent Inquiry' | 'Maintenance Request' | 'Payment Question' | 'General Question' | 'Custom'>('Rent Inquiry');
  const [customMessage, setCustomMessage] = React.useState<string>('');
  const [customSubject, setCustomSubject] = React.useState<string>('');
  const [customBody, setCustomBody] = React.useState<string>('');
  const [showPreview, setShowPreview] = React.useState(false);
  const [isEditingCustom, setIsEditingCustom] = React.useState(false);
  
  // Dynamic inputs state
  const [maintenanceDetails, setMaintenanceDetails] = React.useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = React.useState<'Low' | 'Medium' | 'High'>('Medium');
  const [paymentAmount, setPaymentAmount] = React.useState<string>('');
  const [paymentDate, setPaymentDate] = React.useState<string>('');
  const [paymentReference, setPaymentReference] = React.useState<string>('');
  const [rentQuestions, setRentQuestions] = React.useState<string[]>(['']);
  const [paymentQuestions, setPaymentQuestions] = React.useState<string[]>(['']);
  const [generalQuestions, setGeneralQuestions] = React.useState<string[]>(['']);

  // Question management functions
  const addQuestion = (questionType: 'rent' | 'payment' | 'general') => {
    switch (questionType) {
      case 'rent':
        setRentQuestions([...rentQuestions, '']);
        break;
      case 'payment':
        setPaymentQuestions([...paymentQuestions, '']);
        break;
      case 'general':
        setGeneralQuestions([...generalQuestions, '']);
        break;
    }
  };

  const updateQuestion = (questionType: 'rent' | 'payment' | 'general', index: number, value: string) => {
    switch (questionType) {
      case 'rent':
        const newRentQuestions = [...rentQuestions];
        newRentQuestions[index] = value;
        setRentQuestions(newRentQuestions);
        break;
      case 'payment':
        const newPaymentQuestions = [...paymentQuestions];
        newPaymentQuestions[index] = value;
        setPaymentQuestions(newPaymentQuestions);
        break;
      case 'general':
        const newGeneralQuestions = [...generalQuestions];
        newGeneralQuestions[index] = value;
        setGeneralQuestions(newGeneralQuestions);
        break;
    }
  };

  const removeQuestion = (questionType: 'rent' | 'payment' | 'general', index: number) => {
    switch (questionType) {
      case 'rent':
        if (rentQuestions.length > 1) {
          setRentQuestions(rentQuestions.filter((_, i) => i !== index));
        }
        break;
      case 'payment':
        if (paymentQuestions.length > 1) {
          setPaymentQuestions(paymentQuestions.filter((_, i) => i !== index));
        }
        break;
      case 'general':
        if (generalQuestions.length > 1) {
          setGeneralQuestions(generalQuestions.filter((_, i) => i !== index));
        }
        break;
    }
  };

  const messageTemplates: Record<'Rent Inquiry' | 'Maintenance Request' | 'Payment Question' | 'General Question', MessageTemplate> = {
    'Rent Inquiry': {
      subject: `Rent Inquiry - ${details?.property.address}`,
      body: `Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I hope this message finds you well. I'm writing to inquire about the rent for ${details?.property.address}.

Current Rent: ${nairaSign}${details?.property.annualRent.toLocaleString()}

I have a few questions regarding the rent:
${rentQuestions.filter(q => q.trim()).map((question, index) => `${index + 1}. ${question || '[Please enter your question]'}`).join('\n')}

Could you please provide clarification on these matters? Thank you for your assistance.

Best regards,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ''}
${details?.user.email}`
    },
    'Maintenance Request': {
      subject: `Maintenance Request - ${details?.property.address}`,
      body: `Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I'm writing to request maintenance for ${details?.property.address}.

Maintenance Details: ${maintenanceDetails || '[Please describe the issue]'}
Urgency Level: ${urgencyLevel}

Additional Information:
- [Any specific details about the issue]
- [Preferred timing for maintenance if applicable]
- [Any other relevant information]

Please let me know when I can expect someone to address this issue. Thank you for your prompt attention.

Sincerely,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ''}
${details?.user.email}`
    },
    'Payment Question': {
      subject: `Payment Inquiry - ${details?.property.address}`,
      body: `Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I'm writing regarding a payment question for ${details?.property.address}.

${paymentAmount ? `Amount: ${nairaSign}${parseInt(paymentAmount).toLocaleString()}` : '[Payment amount if applicable]'}
${paymentDate ? `Date: ${paymentDate}` : '[Payment date if applicable]'}
${paymentReference ? `Reference: ${paymentReference}` : '[Payment reference if applicable]'}

My question(s):
${paymentQuestions.filter(q => q.trim()).map((question, index) => `${index + 1}. ${question || '[Please enter your question]'}`).join('\n')}

Could you please clarify these matters? I appreciate your assistance.

Best regards,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ''}
${details?.user.email}`
    },
    'General Question': {
      subject: `General Inquiry - ${details?.property.address}`,
      body: `Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I hope you're doing well. I'm writing with a general inquiry regarding ${details?.property.address}.

My question(s):
${generalQuestions.filter(q => q.trim()).map((question, index) => `${index + 1}. ${question || '[Please enter your question]'}`).join('\n')}

I would appreciate your guidance on these matters. Please let me know if you need any additional information from my side.

Thank you for your time and assistance.

Best regards,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ''}
${details?.user.email}`
    }
  };

  // Initialize custom message when switching to Custom type
  React.useEffect(() => {
    if (messageType === 'Custom' && !customSubject) {
      setCustomSubject(`Inquiry - ${details?.property.address}`);
      setCustomBody(`Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I'm writing to you regarding ${details?.property.address}.

[Your message here]

Best regards,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ''}
${details?.user.email}`);
    }
  }, [messageType, details, customSubject]);

  // Reset dynamic inputs when message type changes
  React.useEffect(() => {
    setMaintenanceDetails('');
    setUrgencyLevel('Medium');
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentReference('');
    setRentQuestions(['']);
    setPaymentQuestions(['']);
    setGeneralQuestions(['']);
  }, [messageType]);

  const getCurrentTemplate = (): MessageTemplate => {
    if (messageType === 'Custom') {
      return {
        subject: customSubject,
        body: customBody
      };
    }
    return messageTemplates[messageType];
  };

  const handleSendMessage = (): void => {
    const template = getCurrentTemplate();
    const finalBody = messageType !== 'Custom' && customMessage 
      ? `${template.body}\n\nAdditional Note: ${customMessage}`
      : template.body;

    const mailtoLink = `mailto:${details?.property.agent.userId.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(finalBody)}`;
    window.open(mailtoLink, '_blank');
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCustomMessage('');
    setCustomSubject('');
    setCustomBody('');
    setShowPreview(false);
    setMessageType('Rent Inquiry');
    setIsEditingCustom(false);
    setMaintenanceDetails('');
    setUrgencyLevel('Medium');
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentReference('');
    setRentQuestions(['']);
    setPaymentQuestions(['']);
    setGeneralQuestions(['']);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const renderQuestionInputs = (questionType: 'rent' | 'payment' | 'general') => {
    const questions = questionType === 'rent' ? rentQuestions : questionType === 'payment' ? paymentQuestions : generalQuestions;
    const setQuestions = questionType === 'rent' ? setRentQuestions : questionType === 'payment' ? setPaymentQuestions : setGeneralQuestions;
    const title = questionType === 'rent' ? 'Rent Questions' : questionType === 'payment' ? 'Payment Questions' : 'General Questions';
    const placeholder = questionType === 'rent' ? 'Enter your rent-related question' : questionType === 'payment' ? 'Enter your payment-related question' : 'Enter your general question';

    return (
      <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {title}
          </h4>
          <button
            type="button"
            onClick={() => addQuestion(questionType)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
            Add Question
          </button>
        </div>
        
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="mt-2 text-sm font-medium text-gray-700 min-w-[20px]">{index + 1}.</span>
              <input
                type="text"
                value={question}
                onChange={(e) => updateQuestion(questionType, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionType, index)}
                  className="mt-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {questions.filter(q => q.trim()).length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">
            Add at least one question to send your inquiry
          </p>
        )}
      </div>
    );
  };

  const renderDynamicInputs = () => {
    switch (messageType) {
      case 'Rent Inquiry':
        return renderQuestionInputs('rent');
      
      case 'Maintenance Request':
        return (
          <div className="space-y-3 border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Maintenance Details *</label>
                <textarea
                  value={maintenanceDetails}
                  onChange={(e) => setMaintenanceDetails(e.target.value)}
                  placeholder="Describe the maintenance issue or request..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                <CustomSelect
                  placeholder="Select urgency level"
                  data={['Low', 'Medium', 'High']}
                  value={urgencyLevel}
                  onChange={(value: string) => {
                    if (value === 'Low' || value === 'Medium' || value === 'High') {
                      setUrgencyLevel(value);
                    }
                  }}
                  style="border-gray-300"
                  height="h-10"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Payment Question':
        return (
          <div className="space-y-4">
            <div className="space-y-3 border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm">
                      {nairaSign}
                    </span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                      className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter payment reference or transaction ID"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
            </div>
            {renderQuestionInputs('payment')}
          </div>
        );
      
      case 'General Question':
        return renderQuestionInputs('general');
      
      default:
        return null;
    }
  };

  const renderEditor = () => (
    <div className="space-y-4">
      {/* Agent and Property Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Agent:</span> {details?.property.agent.userId.surName} {details?.property.agent.userId.lastName}</p>
          <p><span className="font-medium">Agent Email:</span> {details?.property.agent.userId.email}</p>
          <p><span className="font-medium">Property:</span> {details?.property.address}</p>
          <p><span className="font-medium">Current Rent:</span> {nairaSign}{details?.property.annualRent.toLocaleString()}</p>
          {details?.property.agent.officeNumber && (
            <p><span className="font-medium">Office:</span> {details?.property.agent.officeNumber}</p>
          )}
          {details?.property.agent.agencyName && (
            <p><span className="font-medium">Agency:</span> {details?.property.agent.agencyName}</p>
          )}
        </div>
      </div>

      {/* Message Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">Message Type</label>
        <CustomSelect
          placeholder="Choose message type"
          data={['Rent Inquiry', 'Maintenance Request', 'Payment Question', 'General Question', 'Custom']}
          value={messageType}
          onChange={(value: string) => {
            if (value === 'Rent Inquiry' || value === 'Maintenance Request' || value === 'Payment Question' || value === 'General Question' || value === 'Custom') {
              setMessageType(value);
              setIsEditingCustom(value === 'Custom');
            }
          }}
          style="border-black/80"
          height="h-10"
        />
        <p className="text-xs text-gray-500">
          {messageType === 'Rent Inquiry' && 'Ask questions about rent payments or adjustments'}
          {messageType === 'Maintenance Request' && 'Request maintenance or report issues'}
          {messageType === 'Payment Question' && 'Inquire about payments or billing'}
          {messageType === 'General Question' && 'Ask general questions about the property'}
          {messageType === 'Custom' && 'Create a custom message about any topic'}
        </p>
      </div>

      {/* Dynamic Inputs based on message type */}
      {renderDynamicInputs()}

      {/* Custom Message Editor */}
      {messageType === 'Custom' && (
        <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
              Custom Message
            </h4>
            <button
              onClick={() => setIsEditingCustom(!isEditingCustom)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isEditingCustom ? 'Use Template' : 'Edit Custom Message'}
            </button>
          </div>

          {isEditingCustom ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter email subject..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Message Body</label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your custom message..."
                />
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium mb-2">Subject: {customSubject}</p>
              <pre className="text-sm whitespace-pre-wrap text-gray-700">{customBody}</pre>
            </div>
          )}
        </div>
      )}

      {/* Additional Message for Template Types */}
      {messageType !== 'Custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Additional Note (Optional)</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add any personal notes or specific instructions..."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      {/* Preview Button */}
      <button 
        type="button" 
        className="flex items-center gap-2 bg-gray-100 border border-gray-300 py-2 px-3 rounded-md text-sm hover:bg-gray-200 transition-colors w-full justify-center"
        onClick={() => setShowPreview(true)}
      >
        <h4 className="font-semibold text-gray-900">Preview Message</h4>
        <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
      </button>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <button 
          onClick={handleClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          Open in Email Client
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <button 
        className="flex items-center gap-2 mb-4 bg-gray-100 border border-gray-300 py-2 px-3 rounded-md text-sm hover:bg-gray-200 transition-colors"
        onClick={() => setShowPreview(false)}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
        <span className="font-semibold text-gray-900">Back To Editor</span>
      </button>

      {/* Preview Content */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Message Preview</h4>
        
        <div className="space-y-3">
          <div>
            <span className="font-medium text-sm text-gray-700">To:</span>
            <span className="ml-2 text-sm">{details?.property.agent.userId.email}</span>
          </div>
          
          <div>
            <span className="font-medium text-sm text-gray-700">Subject:</span>
            <span className="ml-2 text-sm font-semibold">{getCurrentTemplate().subject}</span>
          </div>

          <div className="bg-white rounded border p-3 mt-2">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {messageType !== 'Custom' && customMessage 
                ? `${getCurrentTemplate().body}\n\nAdditional Note: ${customMessage}`
                : getCurrentTemplate().body
              }
            </pre>
          </div>
        </div>
      </div>

      {/* Action Buttons in Preview */}
      <div className="flex gap-3 justify-end pt-4">
        <button 
          onClick={() => setShowPreview(false)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Back to Edit
        </button>
        <button 
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          Send Email
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Contact Agent"
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
      useCloseButton
      useSeparator
    >
      <div className="py-2">
        {showPreview ? renderPreview() : renderEditor()}
      </div>
    </Modal>
  );
};

export default ContactAgent;