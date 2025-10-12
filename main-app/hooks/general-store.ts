import { ClientProps } from "@/lib/types";
import { create } from "zustand";

type modalControlProps = {
  isOpen:boolean
  onOpen: () => void
  onClose: () => void
};

interface rentRenewalModalProps extends modalControlProps {
  details: ClientProps | null;
  isOverdue: boolean;
  overdueDays: number | null;
  setOverdueDays: (overdueDays: number) => void;
  setIsOverdue: (isOverdue: boolean) => void;
  setDetails: (details: ClientProps) => void;
  clearDetails: () => void;
}

interface contactUserModalProps extends modalControlProps {
  details: ClientProps | null;
  setDetails: (details: ClientProps) => void;
  clearDetails: () => void;
}

type togglePageProps ={
  page: "newsletter" | "contact";
  setPage: (page: "newsletter" | "contact") => void
}

type breadcrumbsProps = {
  currentPage: string;
  setCurrentPage: (page:string) => void;
  clearCurrentPage: () => void;
};

export const useBreadCrumbs = create<breadcrumbsProps>((set) => ({
  currentPage: '',
  setCurrentPage: (page:string) => set({currentPage: page}),
  clearCurrentPage: () => set({currentPage: ""})
}))

export const useOpenMobileMenu = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useOpenDashboardMenu = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const usePrivacyPolicyModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTermsOfServiceModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTermsAndConditionModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useCookiesModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useUserOnboardingModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useAgentOnboardingModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useInspectionConditionModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useStartRentOutModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTransactionModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const usePaymentModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useDeleteAccountModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useDeletePropertiesModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTransferAccountModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useRejectAgentModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const togglePage = create<togglePageProps>((set) => ({
  page: "contact",
  setPage: (page: "newsletter" | "contact") => set({ page }),
}));

export const useRenewalReminderModal =  create<rentRenewalModalProps>((set) => ({
  isOpen: false,
  details: null,
  isOverdue: false,
  overdueDays: null,
  setDetails: (details) => set({details: details}),
  setIsOverdue: (isOverdue) => set({isOverdue: isOverdue}),
  setOverdueDays: (overdueDays) => set({overdueDays: overdueDays}),
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  clearDetails: () => set({ details: null }),
}));

export const useContactUserModal =  create<contactUserModalProps>((set) => ({
  isOpen: false,
  details: null,
  setDetails: (details) => set({details: details}),
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  clearDetails: () => set({ details: null }),
}));

export const useRentExtensionModal =  create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));




