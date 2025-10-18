"use client";

import React from "react";
import Modal from "../ui/modal";
import { useRentExtensionModal } from "@/hooks/general-store";
import { formatDate, nairaSign } from "@/lib/utils";
import CustomSelect from "../ui/custom-select";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

export interface ReminderTemplate {
  subject: string;
  body: string;
}

const RentExtensionsModal = () => {
  const { onClose, isOpen, details } = useRentExtensionModal();

  const [extensionDays, setExtensionDays] = React.useState<string>("7 days");
  const [reason, setReason] = React.useState<string>("Delayed salary payment");
  const [proposedDate, setProposedDate] = React.useState<Date | undefined>(undefined)
  const [showPreview, setShowPreview] = React.useState(false);

  console.log(extensionDays);
  console.log(formatDate(proposedDate?.toISOString() || ""));

  const [open, setOpen] = React.useState(false);

  const subject = `Request for Rent Payment Extension - ${details?.property.address}`;

  const calculateProposedDate = (days: string): string => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString();
  };
  
  const formattedDate = formatDate(proposedDate?.toISOString() || calculateProposedDate(extensionDays.split('')[0]))

  const body = `Dear ${details?.property.agent.userId.surName} ${details?.property.agent.userId.lastName},

I am writing to respectfully request an extension for the rent payment for ${details?.property.address}.

I am requesting an extension of ${extensionDays === "custom" ? "a few" : extensionDays.split('')[0]} day(s), with a proposed new payment date of ${formattedDate}.

${reason ? `Reason for request: ${reason}` : "I am currently experiencing temporary financial constraints that make it difficult to meet the original deadline."}

I want to assure you that I am committed to fulfilling my rental obligations and will make the payment of $${details?.property.annualRent} by the proposed date. This is a temporary situation, and I expect to be back on track with regular payments afterward.

I would greatly appreciate your understanding and consideration of this request. Please let me know if this extension is acceptable or if we can discuss alternative arrangements.

Thank you for your understanding.

Sincerely,
${details?.user.surName} ${details?.user.lastName}
${details?.user.phoneNumber ? `Phone: ${details?.user.phoneNumber}` : ""}`;

  const mailtoLink = `mailto:${details?.property.agent.userId.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleSendReminder = () => {
    window.open(mailtoLink, "_blank");
    onClose();
  };

  const handleClose = () => {
    onClose();
    setReason("");
    setShowPreview(false);
    setExtensionDays("7 days");
    setReason("Delayed salary payment")
    setProposedDate(undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Payment Extension"
      width="lg:w-[600px] xl:w-[700px] md:w-[550px]"
      useCloseButton
    >
      <div className="space-y-4">
        {showPreview ? (
          <React.Fragment>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
              <h4 className="font-semibold text-gray-900 mb-3">
                Message Preview
              </h4>
              <p className="font-medium">Subject: {subject}</p>
              <div className="mt-2 bg-gray-100 rounded border p-2">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {body}
                </pre>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Back to Editor
              </button>
              <button
                onClick={handleSendReminder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Send Email
              </button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <h4 className="font-semibold text-gray-900 mb-2">
                Tenant Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-medium">Tenant:</span>{" "}
                  {details?.user.surName} {details?.user.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {details?.user.email}
                </p>
                <p>
                  <span className="font-medium">Property:</span>{" "}
                  {details?.property.address}
                </p>
                <p>
                  <span className="font-medium">Current Rent:</span> {nairaSign}
                  {details?.property.annualRent.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <label className="block text-sm font-semibold text-gray-900">
                Extension Period
              </label>
              <CustomSelect
                placeholder="Choose extension days"
                data={["3 days", "7 days", "14 days", "30 days", "custom days"]}
                value={extensionDays}
                onChange={(value: string) => {
                  setExtensionDays(value);
                }}
                style="border-black/80 rounded-md"
                height="h-10"
              />
              { extensionDays === "custom days" && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal h-10"
                    >
                      {proposedDate ? formatDate(proposedDate.toISOString()) : "select new date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 z-[80000]" align="start">
                    <Calendar
                      mode="single"
                      selected={proposedDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setProposedDate(date)
                        setOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}

            </div>
            <div className="space-y-2 mt-3">
              <label className="block text-sm font-semibold text-gray-900">
                Reason for Extension (Optional but recommended):
              </label>
              <CustomSelect
                placeholder="Choose a reason..."
                data={["Unexpected medical expenses", "Temporary job loss", "Family emergency", "Delayed salary payment", "Other financial constraints"]}
                value={reason}
                onChange={(value: string) => {
                  setReason(value);
                }}
                style="border-black/80 rounded-md"
                height="h-10"
              />
              {reason === 'Other financial constraints' && (
                <textarea
                  placeholder="Please briefly explain your situation..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm md:h-20 h-16 resize-none focus:ring-0 outline-none focus:outline-none"
                />
              )}
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
                onClick={handleClose}
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
        )}
      </div>
    </Modal>
  );
};

export default RentExtensionsModal;
