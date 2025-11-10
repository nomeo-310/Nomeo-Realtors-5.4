"use client";

import React from "react";
import Modal from "../ui/modal";
import { useRejectAgentModal } from "@/hooks/general-store";
import { usePathname } from "next/navigation";
import { Loader2, Check, Eye, Edit, MapPin, Phone, DollarSign, Building, FileText, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { rejectAgent } from "@/actions/verification-actions";

// Predefined rejection reasons with icons for agency verification
const PREDEFINED_REASONS = [
  {
    id: "invalid-address",
    text: "Agency physical address is invalid or cannot be verified",
    icon: MapPin
  },
  {
    id: "invalid-phone",
    text: "Phone number is invalid or not in service",
    icon: Phone
  },
  {
    id: "high-fees",
    text: "Inspection/registration fees are too high or unreasonable",
    icon: DollarSign
  },
  {
    id: "not-registered",
    text: "Agency is not properly registered with authorities",
    icon: Building
  },
  {
    id: "missing-documents",
    text: "Required business registration documents are missing",
    icon: FileText
  },
  {
    id: "invalid-license",
    text: "Real estate license is invalid or expired",
    icon: Shield
  },
  {
    id: "poor-reputation",
    text: "Agency has poor reputation or negative reviews",
    icon: User
  },
  {
    id: "suspicious-activity",
    text: "Suspicious activity or fraudulent information detected",
    icon: Shield
  },
  {
    id: "incomplete-profile",
    text: "Agency profile information is incomplete",
    icon: User
  },
  {
    id: "unverified-bank",
    text: "Bank account information could not be verified",
    icon: DollarSign
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
  const agentId = localStorage.getItem("rejection-agentId") || "";

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
    
    if (predefined.length > 0) {
      message += "Agency Verification Rejection Reasons:\n" + predefined.map(reason => `• ${reason}`).join("\n");
    }
    
    if (custom) {
      if (message) message += "\n\n";
      message += "Additional Comments:\n" + custom;
    }
    
    return message;
  };

  const handleRejectAgent = async () => {
    if (!isPreview) {
      setIsPreview(true);
      return;
    }

    setSending(true);
    const finalMessage = getFinalRejectionMessage();
    
    const response = await rejectAgent({
      agentId: agentId!,
      reason: finalMessage,
      path: pathname,
    });
    
    if (response.success) {
      toast.success(response.message);
      setSending(false);
      onClose();
      // Reset form
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
            This message will be sent to the agency. They will see all the selected reasons for rejection.
          </p>
        </div>
        
        <div className="w-full flex flex-row gap-2 justify-end">
          <button 
            className="w-fit px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-xs md:text-sm flex items-center gap-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setIsPreview(false)}
            disabled={sending}
          >
            <Edit className="size-4" />
            Edit Reasons
          </button>
          <button
            className="flex items-center gap-3 w-fit px-4 py-2 bg-red-600 text-white rounded-md text-xs md:text-sm disabled:opacity-50 hover:bg-red-700 transition-colors"
            onClick={handleRejectAgent}
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
            Select all issues found during agency verification
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
            placeholder="Provide specific feedback about verification issues, instructions for correction, or additional details that will help the agency resolve the issues..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific about what documentation or information needs to be corrected for successful verification.
          </p>
        </div>

        {/* Selection Summary */}
        {canProceed && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Check className="size-4" />
                  Ready for Preview
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {selectedReasons.length} verification issue{selectedReasons.length !== 1 ? 's' : ''} found
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
          className="w-fit px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-xs md:text-sm hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          onClick={onClose}
          disabled={sending}
        >
          Cancel
        </button>
        <button
          className="flex items-center gap-3 w-fit px-4 py-2 bg-secondary-blue text-white rounded-md text-xs md:text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
          onClick={handleRejectAgent}
          disabled={sending || !canProceed}
        >
          {sending ? "Processing..." : "Continue to Preview"}
          {sending && <Loader2 className="size-4 animate-spin"/>}
        </button>
      </div>
    </div>
  );
};

const AgentRejectionModal = () => {
  const agentRejectionControl = useRejectAgentModal();

  const handleClose = () => {
    agentRejectionControl.onClose();
  };

  return (
    <Modal
      isOpen={agentRejectionControl.isOpen}
      onClose={handleClose}
      useCloseButton
      title="Reject Agency Verification"
      useSeparator
      width="xl:w-[650px] lg:w-[600px] md:w-[550px]"
    >
      <RejectionForm onClose={handleClose} />
    </Modal>
  );
};

export default AgentRejectionModal;