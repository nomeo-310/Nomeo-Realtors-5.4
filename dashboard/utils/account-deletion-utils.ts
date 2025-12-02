/**
 * Calculate remaining days before permanent deletion
 * @param deletedDate - Date when account was deleted (string or Date object)
 * @param gracePeriodDays - Number of days in grace period (default: 30)
 * @returns Object containing remaining days and status
 */


export interface DeletionStatus {
  remainingDays: number;
  isPermanentlyDeleted: boolean;
  gracePeriodEndDate: Date;
  statusMessage: string;
  statusColor: 'green' | 'yellow' | 'red';
}

export const calculateDeletionStatus = (
  deletedDate: Date | string,
  gracePeriodDays: number = 30
): DeletionStatus => {
  // Parse the deleted date
  const deleted = typeof deletedDate === 'string' 
    ? new Date(deletedDate) 
    : deletedDate;
  
  // Calculate grace period end date
  const gracePeriodEnd = new Date(deleted);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);
  
  // Get current date
  const now = new Date();
  
  // Calculate remaining days
  const timeDiff = gracePeriodEnd.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  
  // Determine status
  const isPermanentlyDeleted = timeDiff <= 0;
  
  // Generate status message and color
  let statusMessage = '';
  let statusColor: 'green' | 'yellow' | 'red' = 'green';
  
  if (isPermanentlyDeleted) {
    statusMessage = 'Account permanently deleted';
    statusColor = 'red';
  } else if (remainingDays <= 7) {
    statusMessage = `${remainingDays} days left to restore`;
    statusColor = 'red';
  } else if (remainingDays <= 14) {
    statusMessage = `${remainingDays} days left to restore`;
    statusColor = 'yellow';
  } else {
    statusMessage = `${remainingDays} days left to restore`;
    statusColor = 'green';
  }
  
  return {
    remainingDays,
    isPermanentlyDeleted,
    gracePeriodEndDate: gracePeriodEnd,
    statusMessage,
    statusColor
  };
};

/**
 * Check if account can be restored
 */
export const canRestoreAccount = (
  deletedDate: Date | string,
  gracePeriodDays: number = 30
): boolean => {
  const status = calculateDeletionStatus(deletedDate, gracePeriodDays);
  return !status.isPermanentlyDeleted;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate deletion progress percentage
 */
export const getDeletionProgress = (
  deletedDate: Date | string,
  gracePeriodDays: number = 30
): number => {
  const deleted = typeof deletedDate === 'string' 
    ? new Date(deletedDate) 
    : deletedDate;
  
  const now = new Date();
  const gracePeriodEnd = new Date(deleted);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);
  
  const totalTime = gracePeriodEnd.getTime() - deleted.getTime();
  const elapsedTime = now.getTime() - deleted.getTime();
  
  // Clamp between 0 and 100
  return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
};