import { create } from "zustand";

type modalControlProps = {
  isOpen:boolean
  onOpen: () => void
  onClose: () => void
};

export const useCookiesModal = create<modalControlProps>((set) => ({
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

export const useRejectAgentModal = create<modalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));