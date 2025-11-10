"use client";

import React from "react";
import Modal from "../ui/modal";
import { usePathname } from "next/navigation";
import { Loader2, Check, Eye, Edit, MapPin, Landmark, Image, Ruler, DollarSign, FileText, Flag, Home } from "lucide-react";
import { toast } from "sonner";
import { rejectApartment } from "@/actions/verification-actions";
import { useRejectPropertyModal } from "@/hooks/general-store";

// Predefined rejection reasons with icons for property verification
const PREDEFINED_REASONS = [
  {
    id: "address-not-verified",
    text: "Property address cannot be verified or is invalid",
    icon: MapPin
  },
  {
    id: "false-landmark",
    text: "Closest landmark information is false or inaccurate",
    icon: Landmark
  },
  {
    id: "blurry-photos",
    text: "Property photos are blurry, low quality, or insufficient",
    icon: Image
  },
  {
    id: "unreasonable-sqft",
    text: "Square footage seems unreasonable for the property type",
    icon: Ruler
  },
  {
    id: "missing-rent",
    text: "Monthly rent price is missing or not specified",
    icon: DollarSign
  },
  {
    id: "poor-description",
    text: "Property description is poor, incomplete, or misleading",
    icon: FileText
  },
  {
    id: "property-flagged",
    text: "Property has been flagged for suspicious activity",
    icon: Flag
  },
  {
    id: "incorrect-type",
    text: "Property type classification is incorrect",
    icon: Home
  },
  {
    id: "amenities-missing",
    text: "Key amenities information is missing or inaccurate",
    icon: Home
  },
  {
    id: "contact-unreachable",
    text: "Listing contact information is unreachable",
    icon: MapPin
  },
  {
    id: "price-unreasonable",
    text: "Asking price is unreasonable for the property",
    icon: DollarSign
  },
  {
    id: "duplicate-listing",
    text: "Duplicate or repetitive listing detected",
    icon: FileText
  },
  {
    id: "other",
    text: "Other (please specify below)",
    icon: FileText
  }
];

const RejectionForm = ({ onClose }: { onClose: () => void }) => {
  const [selectedReasons, setSelectedReasons] = React.useState<string[]>([]);
  const [customReason, setCustomReason] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);
  const pathname = usePathname();
  const propertyId = localStorage.getItem("rejection-propertyId") || "";

  // Toggle predefined reason selection
  const toggleReason = (reasonText: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonText)
        ? prev.filter(r => r !== reasonText)
        : [...prev, reasonText]
    );
  };

  // Combine all reasons for final message
  const getFinalRejectionMessage = () => {
    const predefined = selectedReasons.filter(reason => reason !== "Other (please specify below)");
    const custom = customReason.trim();
    
    let message = "";
    
    //use this method when sending email 
    // if (predefined.length > 0) {
    //   message += "Property Listing Rejection Reasons:\n" + predefined.map(reason => `• ${reason}`).join("\n");
    // }

    if (predefined.length > 0) {
      message += "Property Listing Rejection Reasons:" + predefined.map((reason, index) => `${index+1}• ${reason}`).join(", ");
    }
    
    //use this when sending mail
    // if (custom) {
    //   if (message) message += "\n\n";
    //   message += "Additional Comments:\n" + custom;
    // }

    if (custom) {
      if (message) message += ". ";
      message += "In addition : " + custom;
    }
    
    return message;
  };

  const handleRejectProperty = async () => {
    if (!isPreview) {
      setIsPreview(true);
      return;
    }

    setSending(true);
    const finalMessage = getFinalRejectionMessage();
    const response = await rejectApartment({
      apartmentId: propertyId!,
      reason: finalMessage,
      path: pathname,
    });
    
    if (response.success) {
      toast.success(response.message);
      setSending(false);
      onClose();
      setSelectedReasons([]);
      setCustomReason("");
      setIsPreview(false);
    } else {
      toast.error(response.message);
      setSending(false);
    }
  };

  const canProceed = selectedReasons.length > 0 || customReason.trim();
  const finalMessage = getFinalRejectionMessage();

  if (isPreview) {
    return (
      <div className="w-full">
        <div className="w-full mb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Eye className="size-5" />
            Preview Rejection Message
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {finalMessage || "No rejection reason provided."}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This message will be sent to the property lister. They will see all the selected reasons for rejection.
          </p>
        </div>
        
        <div className="w-full flex flex-row gap-2 justify-end">
          <button 
            className="w-fit px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-xs lg:text-sm flex items-center gap-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setIsPreview(false)}
            disabled={sending}
          >
            <Edit className="size-4" />
            Edit Reasons
          </button>
          <button
            className="flex items-center gap-3 w-fit px-4 py-2 bg-red-600 text-white rounded-md text-xs lg:text-sm disabled:opacity-50 hover:bg-red-700 transition-colors"
            onClick={handleRejectProperty}
            disabled={sending || !canProceed}
          >
            {sending ? "Sending Rejection..." : "Confirm & Send Rejection"}
            {sending && <Loader2 className="size-4 animate-spin"/>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-4">
        {/* Predefined Reasons */}
        <div className="w-full">
          <label className="text-sm lg:text-base font-semibold mb-3 block">
            Select Rejection Reasons
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select all issues found with this property listing
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
            {PREDEFINED_REASONS.map((reason) => {
              const IconComponent = reason.icon;
              return (
                <div
                  key={reason.id}
                  className={`flex items-start gap-3 lg:p-2.5 p-2 border rounded-md cursor-pointer transition-all ${
                    selectedReasons.includes(reason.text)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => toggleReason(reason.text)}
                >
                  <div className={`mt-0.5 lg:size-5 size-4 border rounded flex items-center justify-center flex-shrink-0 ${
                    selectedReasons.includes(reason.text)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-400"
                  }`}>
                    {selectedReasons.includes(reason.text) && (
                      <Check className="size-3 text-white" />
                    )}
                  </div>
                  <IconComponent className="size-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs lg:text-sm flex-1 leading-tight">{reason.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="w-full">
          <label htmlFor="customReason" className="text-sm lg:text-base font-semibold mb-2 block">
            Additional Comments & Instructions
          </label>
          <textarea
            id="customReason"
            className="w-full lg:p-2.5 p-2 border border-gray-300 dark:border-gray-600 rounded-md h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 text-xs lg:text-sm"
            placeholder="Provide specific feedback about the property listing issues, instructions for correction, or additional details that will help improve the listing..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific about what needs to be corrected for the property listing to be approved.
          </p>
        </div>

        {/* Selection Summary */}
        { canProceed && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Check className="size-4" />
                  Ready for Preview
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {selectedReasons.length} issue{selectedReasons.length !== 1 ? 's' : ''} found
                  {customReason.trim() && " + additional comments"}
                </p>
              </div>
              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Eye className="size-4" />
                Preview Message
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-row gap-2 justify-end mt-6">
        <button 
          className="w-fit px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-xs lg:text-sm hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          onClick={onClose}
          disabled={sending}
        >
          Cancel
        </button>
        <button
          className="flex items-center gap-3 w-fit px-4 py-2 bg-secondary-blue text-white rounded-md text-xs lg:text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
          onClick={handleRejectProperty}
          disabled={sending || !canProceed}
        >
          {sending ? "Processing..." : "Continue to Preview"}
          {sending && <Loader2 className="size-4 animate-spin"/>}
        </button>
      </div>
    </div>
  );
};

const PropertyRejectionModal = () => {
  const propertyRejectionControl = useRejectPropertyModal();

  const handleClose = () => {
    propertyRejectionControl.onClose();
  };

  return (
    <Modal
      isOpen={propertyRejectionControl.isOpen}
      onClose={handleClose}
      useCloseButton
      title="Reject Property Listing"
      useSeparator
      width="xl:w-[650px] lg:w-[600px] md:w-[550px]"
    >
      <RejectionForm onClose={handleClose} />
    </Modal>
  );
};

export default PropertyRejectionModal;