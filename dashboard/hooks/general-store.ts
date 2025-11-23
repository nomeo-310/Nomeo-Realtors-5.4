import { create } from "zustand";

type ModalControlProps = {
  isOpen:boolean
  onOpen: () => void
  onClose: () => void
};

export interface MessageRecipient {
  id: string;
  surName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  propertyAddress?: string;
  rentAmount?: number;
  isActive?: boolean;
}

export interface AdminMessagingModalStore {
  isOpen: boolean;
  onOpen: (recipient: MessageRecipient) => void;
  onClose: () => void;
  recipient: MessageRecipient | null;
}

export interface UserForRoleAssignment {
  id: string;
  surName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  currentRole: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  isActive: boolean;
}

export interface RoleAssignmentModalStore {
  isOpen: boolean;
  onOpen: (user: UserForRoleAssignment) => void;
  onClose: () => void;
  user: UserForRoleAssignment | null;
}

export interface UserForVerificationRevocation {
  id: string;
  surName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  isVerified: boolean;
}

export interface RevokeVerificationModalStore {
  isOpen: boolean;
  onOpen: (user: UserForVerificationRevocation) => void;
  onClose: () => void;
  user: UserForVerificationRevocation | null;
}

export interface UserForRestriction {
  id: string;
  surName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  isActive: boolean;
  isSuspended?: boolean;
  isBlocked?: boolean;
  suspensionReason?: string;
  blockReason?: string;
}

export interface UnverifiedUser {
  id: string;
  surName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  registrationDate: string;
}

export interface VerificationReminderModalStore {
  isOpen: boolean;
  onOpen: (user: UnverifiedUser) => void;
  onClose: () => void;
  user: UnverifiedUser | null;
}

export interface SuspendUserModalStore {
  isOpen: boolean;
  onOpen: (user: UserForRestriction) => void;
  onClose: () => void;
  user: UserForRestriction | null;
}

export interface BlockUserModalStore {
  isOpen: boolean;
  onOpen: (user: UserForRestriction) => void;
  onClose: () => void;
  user: UserForRestriction | null;
}

export const useCookiesModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const usePrivacyPolicyModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTermsOfServiceModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTermsAndConditionModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useRejectAgentModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useRejectPropertyModal = create<ModalControlProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useMessageUserModal = create<AdminMessagingModalStore>((set) => ({
  isOpen: false,
  recipient: null,
  onOpen: (recipient: MessageRecipient) => set({ isOpen: true, recipient }),
  onClose: () => set({ isOpen: false, recipient: null }),
}));

export const useRoleAssignmentModal = create<RoleAssignmentModalStore>((set) => ({
  isOpen: false,
  user: null,
  onOpen: (user: UserForRoleAssignment) => set({ isOpen: true, user }),
  onClose: () => set({ isOpen: false, user: null }),
}));

export const useRevokeVerificationModal = create<RevokeVerificationModalStore>((set) => ({
  isOpen: false,
  user: null,
  onOpen: (user: UserForVerificationRevocation) => set({ isOpen: true, user }),
  onClose: () => set({ isOpen: false, user: null }),
}));

export const useSuspendUserModal = create<SuspendUserModalStore>((set) => ({
  isOpen: false,
  user: null,
  onOpen: (user: UserForRestriction) => set({ isOpen: true, user }),
  onClose: () => set({ isOpen: false, user: null }),
}));

export const useDeleteUserModal = create<BlockUserModalStore>((set) => ({
  isOpen: false,
  user: null,
  onOpen: (user: UserForRestriction) => set({ isOpen: true, user }),
  onClose: () => set({ isOpen: false, user: null }),
}));

export const useVerificationReminderModal = create<VerificationReminderModalStore>((set) => ({
  isOpen: false,
  user: null,
  onOpen: (user: UnverifiedUser) => set({ isOpen: true, user }),
  onClose: () => set({ isOpen: false, user: null }),
}));