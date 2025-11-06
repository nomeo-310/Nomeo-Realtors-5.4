"use client";

import React from "react";
import Modal from "../ui/modal";
import { useRejectAgentModal } from "@/hooks/general-store";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rejectAgent } from "@/actions/admin-actions";

const RejectionForm = ({ onClose }: { onClose: () => void }) => {
  const [reason, setReason] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const pathname = usePathname();
  const agentId = localStorage.getItem("rejection-agentId") || "";

  const handleRejectAgent = async () => {
    setSending(true);
    const response = await rejectAgent({
      agentId: agentId!,
      reason,
      path: pathname,
    });
    if (response.success) {
      toast.success(response.message);
      setSending(false);
      onClose();
    } else {
      toast.error(response.message);
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="reason"  className="text-sm lg:text-base font-semibold ml-2">
            Reason for Rejection
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md h-[90px] resize-none focus:outline-none outline-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full flex flex-row gap-2 justify-end mt-4">
        <button className="w-fit px-3 py-1.5 bg-gray-300 dark:bg-black rounded-md text-sm lg:text-base" onClick={onClose} disabled={sending}>
          Cancel
        </button>
        <button
          className="flex items-center gap-3 w-fit px-3 py-1.5 bg-secondary-blue text-white rounded-md text-sm lg:text-base disabled:opacity-50"
          onClick={handleRejectAgent}
          disabled={sending || !reason.trim() || !agentId}
        >
          {sending ? "Sending..." : "Send"}
          {sending && <Loader2 className="size-6 animate-spin"/>}
        </button>
      </div>
    </div>
  );
};

const AgentRejectionModal = () => {
  const agentRejectionControl = useRejectAgentModal();

  return (
    <Modal
      isOpen={agentRejectionControl.isOpen}
      onClose={agentRejectionControl.onClose}
      useCloseButton
      title="Agent Rejection"
      useSeparator
      width="xl:w-[500px] lg:w-[450px] md:w-[400px]"
    >
      <RejectionForm onClose={agentRejectionControl.onClose} />
    </Modal>
  );
};

export default AgentRejectionModal;
