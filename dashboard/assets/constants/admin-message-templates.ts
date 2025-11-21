export const USER_MESSAGE_TEMPLATES = [
  {
    id: 'rent-extension-approval',
    title: 'Rent Extension Approved',
    subject: 'Rent Extension Approved',
    body: `Dear {userName},

We are pleased to inform you that your request for a rent extension has been approved.

Thank you for your cooperation.

Best regards,
Admin`
  },
  {
    id: 'rent-payment-confirmation',
    title: 'Rent Payment Confirmed',
    subject: 'Rent Payment Received',
    body: `Dear {userName},

This is to confirm that we have successfully received your rent payment.

Thank you for your timely payment.

Sincerely,
Admin`
  },
  {
    id: 'rent-increase-notice',
    title: 'Rent Increase Notice',
    subject: 'Notice of Rent Adjustment',
    body: `Dear {userName},

This letter serves as formal notice of a rent adjustment for your tenancy.

If you have any questions, please don't hesitate to contact us.

Best regards,
Admin`
  }
];

// Templates for agents
export const AGENT_MESSAGE_TEMPLATES = [
  {
    id: 'target-reminder',
    title: 'Performance Target Reminder',
    subject: 'Performance Targets - Reminder',
    body: `Dear {agentName},

This is a friendly reminder about your performance targets.

Please review your progress and let us know if you need any support.

Best regards,
Admin`
  },
  {
    id: 'client-payment-notification',
    title: 'Client Payment Processed',
    subject: 'Payment Processed for Client',
    body: `Dear {agentName},

We have successfully processed a payment for your client.

This payment has been credited to your management account.

Sincerely,
Admin`
  },
  {
    id: 'new-property-assignment',
    title: 'New Property Assignment',
    subject: 'New Property Assignment',
    body: `Dear {agentName},

You have been assigned to manage a new property.

Please contact the property owner within 48 hours.

Best regards,
Admin`
  }
];

// Templates for admins
export const ADMIN_MESSAGE_TEMPLATES = [
  {
    id: 'system-update',
    title: 'System Update Notification',
    subject: 'System Maintenance Notice',
    body: `Dear {adminName},

This is to inform you about an upcoming system maintenance.

Please plan your activities accordingly.

Best regards,
Admin`
  },
  {
    id: 'performance-report',
    title: 'Monthly Performance Report',
    subject: 'Monthly Performance Summary',
    body: `Dear {adminName},

Here is your monthly performance summary.

Please review and let's schedule a meeting to discuss strategies.

Best regards,
Admin`
  },
  {
    id: 'policy-update',
    title: 'Policy Update Announcement',
    subject: 'Important Policy Update',
    body: `Dear {adminName},

This is to inform you about an important policy update.

Please review the attached document and ensure compliance.

Best regards,
Admin`
  }
];