"use client";

import React from "react";
import Modal from "../ui/modal";
import { useContactUserModal } from "@/hooks/general-store";
import { nairaSign } from "@/lib/utils";
import CustomSelect from "../ui/custom-select";
import { ArrowLeft01Icon, ArrowRight01Icon, Edit01Icon, Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface MessageTemplate {
  subject: string;
  body: string;
}

const ContactUserModal = () => {
  const { onClose, isOpen, details } = useContactUserModal();

  const [messageType, setMessageType] = React.useState<'Rent Increase' | 'Service Charge' | 'Payment Request' | 'House Repairs' | 'Quit Notice' | 'Meetings' | 'Custom'>('Rent Increase');
  const [customMessage, setCustomMessage] = React.useState<string>('');
  const [customSubject, setCustomSubject] = React.useState<string>('');
  const [customBody, setCustomBody] = React.useState<string>('');
  const [showPreview, setShowPreview] = React.useState(false);
  const [isEditingCustom, setIsEditingCustom] = React.useState(false);
  
  // Dynamic inputs state
  const [newRent, setNewRent] = React.useState<string>('');
  const [rentEffectiveDate, setRentEffectiveDate] = React.useState<string>('');
  const [newServiceCharge, setNewServiceCharge] = React.useState<string>('');
  const [serviceChargeEffectiveDate, setServiceChargeEffectiveDate] = React.useState<string>('');
  const [paymentAmount, setPaymentAmount] = React.useState<string>('');
  const [paymentDueDate, setPaymentDueDate] = React.useState<string>('');
  const [paymentPurpose, setPaymentPurpose] = React.useState<string>('');
  const [repairDetails, setRepairDetails] = React.useState<string>('');
  const [repairStartDate, setRepairStartDate] = React.useState<string>('');
  const [repairEndDate, setRepairEndDate] = React.useState<string>('');
  const [workStartTime, setWorkStartTime] = React.useState<string>('');
  const [workEndTime, setWorkEndTime] = React.useState<string>('');
  const [quitReason, setQuitReason] = React.useState<string>('');
  const [vacateDate, setVacateDate] = React.useState<string>('');
  const [noticeDate, setNoticeDate] = React.useState<string>('');
  const [meetingDate, setMeetingDate] = React.useState<string>('');
  const [meetingTime, setMeetingTime] = React.useState<string>('');
  const [meetingLocation, setMeetingLocation] = React.useState<string>('');
  const [agendaItems, setAgendaItems] = React.useState<string[]>(['']);

  const messageTemplates: Record<'Rent Increase' | 'Service Charge' | 'Payment Request' | 'House Repairs' | 'Quit Notice' | 'Meetings', MessageTemplate> = {
    'Rent Increase': {
      subject: `Rent Adjustment Notice - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

I hope this message finds you well. This is to inform you about an adjustment to the rent for ${details?.property.address}.

Current Rent: ${nairaSign}${details?.property.annualRent.toLocaleString()}
New Rent: ${nairaSign}${newRent ? parseInt(newRent).toLocaleString() : '[Insert new rent amount]'}
Effective Date: ${rentEffectiveDate || '[Insert effective date here]'}

This adjustment reflects current market conditions and maintenance costs. The new rate will take effect from the next payment cycle.

Please feel free to reach out if you have any questions or would like to discuss this further.

Best regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    'Service Charge': {
      subject: `Service Charge Update - ${details?.property.address}`,
      body: `Hello ${details?.user.surName} ${details?.user.lastName},

I'm writing to inform you about an update to the service charges for ${details?.property.address}.

Property: ${details?.property.address}
New Service Charge: ${nairaSign}${newServiceCharge ? parseInt(newServiceCharge).toLocaleString() : '[Insert new service charge amount]'}
Effective: ${serviceChargeEffectiveDate || '[Insert effective date]'}

This adjustment is necessary to maintain the quality of services and facilities provided. The updated charge will be included in your next billing statement.

If you have any questions about this change, please don't hesitate to contact me.

Kind regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    'Payment Request': {
      subject: `Payment Request - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

I hope you're doing well. This message is regarding a payment request for ${details?.property.address}.

Property: ${details?.property.address}
Amount Due: ${nairaSign}${paymentAmount ? parseInt(paymentAmount).toLocaleString() : '[Insert amount due]'}
Due Date: ${paymentDueDate || '[Insert due date]'}
Purpose: ${paymentPurpose || '[Insert purpose - e.g., maintenance, repairs, etc.]'}

Please ensure the payment is made by the specified due date. You can make the payment through [insert payment method].

Thank you for your prompt attention to this matter.

Sincerely,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    'House Repairs': {
      subject: `Scheduled Repairs Notice - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

This is to inform you about scheduled repairs/maintenance work at ${details?.property.address}.

Repair Details: ${repairDetails || '[Insert specific repair details]'}
Scheduled Date: ${repairStartDate || '[Insert start date]'} to ${repairEndDate || '[Insert end date]'}
Work Hours: ${workStartTime || '[Start time]'} - ${workEndTime || '[End time]'}

Please note the following:
- Access may be required to certain areas of the property
- There might be temporary disruptions to utilities/services
- We apologize for any inconvenience this may cause

Our team will work to complete the repairs as quickly and efficiently as possible. If you have any concerns or special requirements, please contact me to discuss.

Thank you for your cooperation.

Best regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    'Quit Notice': {
      subject: `Notice to Vacate - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

This letter serves as formal notice to vacate the premises at ${details?.property.address}.

Effective Date of Notice: ${noticeDate || '[Insert notice date]'}
Vacate Date: ${vacateDate || '[Insert vacate date - according to lease terms]'}
Reason: ${quitReason || '[Insert reason - e.g., property sale, major renovations, etc.]'}

As per your lease agreement dated [Insert lease start date], you are required to vacate the premises on or before the specified date. Please ensure:

1. All personal belongings are removed from the property
2. The property is returned in the same condition as when you moved in (normal wear and tear excepted)
3. All keys and access devices are returned
4. The final rent payment and any outstanding charges are settled

A final inspection will be conducted on [Insert inspection date]. Your security deposit will be processed according to the terms of your lease agreement after the inspection.

If you have any questions regarding this notice or need assistance with the moving process, please contact me.

Sincerely,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    },
    'Meetings': {
      subject: `Meeting Invitation - ${details?.property.address}`,
      body: `Dear ${details?.user.surName} ${details?.user.lastName},

You are cordially invited to attend a meeting regarding ${details?.property.address}.

Meeting Date: ${meetingDate || '[Insert meeting date]'}
Meeting Time: ${meetingTime || '[Insert meeting time]'}
Location: ${meetingLocation || '[Insert meeting location/virtual link]'}
Attendees: Tenant, Property Agent, Landlord Lawyer

Agenda:
${agendaItems.filter(item => item.trim()).map((item, index) => `- ${item || `[Insert agenda item ${index + 1}]`}`).join('\n')}

Your presence and input are highly valued. Please confirm your availability by [Insert confirmation date].

If you have any topics you would like to add to the agenda, please let me know in advance.

We look forward to meeting with you.

Best regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`
    }
  };

  // Initialize custom message when switching to Custom type
  React.useEffect(() => {
    if (messageType === 'Custom' && !customSubject) {
      setCustomSubject(`Message Regarding ${details?.property.address}`);
      setCustomBody(`Hello ${details?.user.surName} ${details?.user.lastName},

I'm writing to you regarding ${details?.property.address}.

[Your message here]

Best regards,
${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName}
${details?.property.agent.officeNumber ? `Phone: ${details?.property.agent.officeNumber}` : ''}
${details?.property.agent.agencyName ? details?.property.agent.agencyName : ''}`);
    }
  }, [messageType, details]);

  // Reset dynamic inputs when message type changes
  React.useEffect(() => {
    setNewRent('');
    setRentEffectiveDate('');
    setNewServiceCharge('');
    setServiceChargeEffectiveDate('');
    setPaymentAmount('');
    setPaymentDueDate('');
    setPaymentPurpose('');
    setRepairDetails('');
    setRepairStartDate('');
    setRepairEndDate('');
    setWorkStartTime('');
    setWorkEndTime('');
    setQuitReason('');
    setVacateDate('');
    setNoticeDate('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingLocation('');
    setAgendaItems(['']);
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

    const mailtoLink = `mailto:${details?.user.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(finalBody)}`;
    window.open(mailtoLink, '_blank');
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCustomMessage('');
    setCustomSubject('');
    setCustomBody('');
    setShowPreview(false);
    setMessageType('Rent Increase');
    setIsEditingCustom(false);
    setNewRent('');
    setRentEffectiveDate('');
    setNewServiceCharge('');
    setServiceChargeEffectiveDate('');
    setPaymentAmount('');
    setPaymentDueDate('');
    setPaymentPurpose('');
    setRepairDetails('');
    setRepairStartDate('');
    setRepairEndDate('');
    setWorkStartTime('');
    setWorkEndTime('');
    setQuitReason('');
    setVacateDate('');
    setNoticeDate('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingLocation('');
    setAgendaItems(['']);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Agenda management functions
  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']);
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newAgendaItems = [...agendaItems];
    newAgendaItems[index] = value;
    setAgendaItems(newAgendaItems);
  };

  const removeAgendaItem = (index: number) => {
    if (agendaItems.length > 1) {
      const newAgendaItems = agendaItems.filter((_, i) => i !== index);
      setAgendaItems(newAgendaItems);
    }
  };

  const renderDynamicInputs = () => {
    switch (messageType) {
      case 'Rent Increase':
        return (
          <div className="space-y-3 border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">New Rent Amount *</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm">
                    {nairaSign}
                  </span>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    placeholder="Enter new rent amount"
                    className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                {details?.property.annualRent && newRent && (
                  <p className="text-xs text-gray-600">
                    Increase: {nairaSign}{(parseInt(newRent) - details.property.annualRent).toLocaleString()} 
                    ({(((parseInt(newRent) - details.property.annualRent) / details.property.annualRent) * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Effective Date *</label>
                <input
                  type="date"
                  value={rentEffectiveDate}
                  onChange={(e) => setRentEffectiveDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Service Charge':
        return (
          <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">New Service Charge *</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm">
                    {nairaSign}
                  </span>
                  <input
                    type="number"
                    value={newServiceCharge}
                    onChange={(e) => setNewServiceCharge(e.target.value)}
                    placeholder="Enter new service charge"
                    className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Effective Date *</label>
                <input
                  type="date"
                  value={serviceChargeEffectiveDate}
                  onChange={(e) => setServiceChargeEffectiveDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Payment Request':
        return (
          <div className="space-y-3 border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount Due *</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm">
                    {nairaSign}
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount due"
                    className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                <input
                  type="text"
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  placeholder="Enter payment purpose"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'House Repairs':
        return (
          <div className="space-y-3 border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Repair Details *</label>
                <textarea
                  value={repairDetails}
                  onChange={(e) => setRepairDetails(e.target.value)}
                  placeholder="Describe the repairs or maintenance work"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    value={repairStartDate}
                    onChange={(e) => setRepairStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End Date *</label>
                  <input
                    type="date"
                    value={repairEndDate}
                    onChange={(e) => setRepairEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Work Start Time</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Work End Time</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'Quit Notice':
        return (
          <div className="space-y-3 border border-red-200 bg-red-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notice Date *</label>
                <input
                  type="date"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Vacate Date *</label>
                <input
                  type="date"
                  value={vacateDate}
                  onChange={(e) => setVacateDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reason *</label>
                <input
                  type="text"
                  value={quitReason}
                  onChange={(e) => setQuitReason(e.target.value)}
                  placeholder="Enter reason for quit notice"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Meetings':
        return (
          <div className="space-y-3 border border-purple-200 bg-purple-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Meeting Date *</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Meeting Time *</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location / Virtual Link *</label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Enter meeting location or virtual meeting link"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Agenda Items</label>
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              {agendaItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    placeholder={`Agenda item ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  {agendaItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderEditor = () => (
    <div className="space-y-4">
      {/* Tenant Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Tenant Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Tenant:</span> {details?.user.surName} {details?.user.lastName}</p>
          <p><span className="font-medium">Email:</span> {details?.user.email}</p>
          <p><span className="font-medium">Property:</span> {details?.property.address}</p>
          <p><span className="font-medium">Current Rent:</span> {nairaSign}{details?.property.annualRent.toLocaleString()}</p>
        </div>
      </div>

      {/* Message Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">Message Type</label>
        <CustomSelect
          placeholder="Choose message type"
          data={['Rent Increase', 'Service Charge', 'Payment Request', 'House Repairs', 'Quit Notice', 'Meetings', 'Custom']}
          value={messageType}
          onChange={(value: string) => {
            if (value === 'Rent Increase' || value === 'Service Charge' || value === 'Payment Request' || value === 'House Repairs' || value === 'Quit Notice' || value === 'Meetings' || value === 'Custom') {
              setMessageType(value);
              setIsEditingCustom(value === 'Custom');
            }
          }}
          style="border-black/80"
          height="h-10"
        />
        <p className="text-xs text-gray-500">
          {messageType === 'Rent Increase' && 'Notify tenant about rent adjustment'}
          {messageType === 'Service Charge' && 'Inform about service charge changes'}
          {messageType === 'Payment Request' && 'Request payment for specific items'}
          {messageType === 'House Repairs' && 'Notify about scheduled maintenance or repairs'}
          {messageType === 'Quit Notice' && 'Formal notice for tenant to vacate property'}
          {messageType === 'Meetings' && 'Schedule meeting with tenant, landlord, and lawyer'}
          {messageType === 'Custom' && 'Create a custom message about any topic'}
        </p>
      </div>

      {/* Dynamic Inputs based on message type */}
      {renderDynamicInputs()}

      {/* Custom Message Editor */}
      {messageType === 'Custom' && (
        <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
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
      {!['Custom', 'House Repairs'].includes(messageType) && (
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
            <span className="ml-2 text-sm">{details?.user.email}</span>
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
      title="Send Message to Tenant"
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
      useCloseButton
    >
      <div className="py-2">
        {showPreview ? renderPreview() : renderEditor()}
      </div>
    </Modal>
  );
};

export default ContactUserModal;