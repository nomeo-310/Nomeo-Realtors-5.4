
import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface DeletionReminderEmailProps {
  userName: string;
  userType: string;
  message: string;
  includeRecoveryLink: boolean;
  deletionDate: string;
  daysRemaining: number;
  isUrgent: boolean;
  contactEmail?: string;
  registrationDate?: string;
}

export function DeletionReminderEmailTemplate(props: DeletionReminderEmailProps) {
  const { 
    userName,
    userType,
    message,
    includeRecoveryLink,
    deletionDate,
    daysRemaining,
    isUrgent,
    contactEmail = 'support@nomeorealtors.com',
    registrationDate
  } = props;

  const formattedDeletionDate = new Date(deletionDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const recoveryLink = includeRecoveryLink 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/account/recover?token=${Buffer.from(userName).toString('base64')}&type=deletion`
    : null;

  const getTitleColor = () => {
    if (isUrgent) return '#d32f2f'; // Red for urgent
    if (daysRemaining <= 3) return '#ff9800'; // Orange for high priority
    return '#1976d2'; // Blue for normal
  };

  const getUrgencyLevel = () => {
    if (daysRemaining <= 1) return 'CRITICAL';
    if (daysRemaining <= 3) return 'HIGH';
    if (daysRemaining <= 7) return 'MEDIUM';
    return 'STANDARD';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'user': 'Regular User',
      'agent': 'Real Estate Agent',
      'admin': 'Administrator',
      'superAdmin': 'Super Administrator',
      'creator': 'Content Creator'
    };
    return roleMap[role] || role;
  };

  const getHeaderTitle = () => {
    if (isUrgent) return 'URGENT: Account Deletion Reminder';
    return 'Account Deletion Reminder';
  };

  const getAccountTypeLabel = () => {
    return userType === 'agent' ? 'Agent Account' : 'User Account';
  };

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with urgency indicator */}
          <div style={headerContainerStyle}>
            <Text style={{ ...headerStyle, color: getTitleColor() }}>
              {getHeaderTitle()}
            </Text>
            {isUrgent && (
              <div style={urgentBadgeStyle}>
                ⚠️ URGENT: {daysRemaining} DAYS REMAINING
              </div>
            )}
          </div>

          <Text style={greetingStyle}>
            Dear {userName},
          </Text>

          <Text style={mainTextStyle}>
            This is a reminder regarding the scheduled deletion of your {getAccountTypeLabel()} 
            with Nomeo Realtors. Your account is scheduled to be permanently deleted on <strong>{formattedDeletionDate}</strong>.
          </Text>

          {/* Urgency Status Card */}
          <div style={urgencyCardStyle}>
            <Text style={urgencyTitleStyle}>
              {isUrgent ? '⚠️ URGENT ATTENTION REQUIRED' : '⏰ Account Deletion Timeline'}
            </Text>
            <div style={urgencyInfoStyle}>
              <div style={urgencyItemStyle}>
                <Text style={urgencyLabelStyle}>Days Remaining:</Text>
                <Text style={{...urgencyValueStyle, color: getTitleColor()}}>
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </Text>
              </div>
              <div style={urgencyItemStyle}>
                <Text style={urgencyLabelStyle}>Scheduled Deletion:</Text>
                <Text style={urgencyValueStyle}>{formattedDeletionDate}</Text>
              </div>
              <div style={urgencyItemStyle}>
                <Text style={urgencyLabelStyle}>Reminder Level:</Text>
                <Text style={urgencyValueStyle}>{getUrgencyLevel()}</Text>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>Account Details:</Text>
            <div style={accountDetailsStyle}>
              <div style={detailRowStyle}>
                <Text style={detailLabelStyle}>Account Holder:</Text>
                <Text style={detailValueStyle}>{userName} ({getRoleDisplayName(userType)})</Text>
              </div>
              <div style={detailRowStyle}>
                <Text style={detailLabelStyle}>Account Type:</Text>
                <Text style={detailValueStyle}>{getAccountTypeLabel()}</Text>
              </div>
              {registrationDate && (
                <div style={detailRowStyle}>
                  <Text style={detailLabelStyle}>Registered Since:</Text>
                  <Text style={detailValueStyle}>
                    {new Date(registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div style={messageSectionStyle}>
            <Text style={labelStyle}>Message:</Text>
            <Text style={messageContentStyle}>
              {message}
            </Text>
          </div>

          {/* What Happens After Deletion */}
          <div style={{...sectionStyle, backgroundColor: '#fff8e1'}}>
            <Text style={labelStyle}>⚠️ What Happens After Deletion:</Text>
            <Text style={warningTextStyle}>
              • All your personal data and account information will be permanently removed<br />
              • Your listings, saved properties, and preferences will be deleted<br />
              • Access to Nomeo Realtors services will be terminated<br />
              • This action is <strong>irreversible and permanent</strong><br />
              • Account recovery will not be possible after the deletion date
            </Text>
          </div>

          {/* Recovery Options */}
          {includeRecoveryLink && recoveryLink && (
            <div style={{...sectionStyle, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50'}}>
              <Text style={labelStyle}>🔄 Account Recovery Option:</Text>
              <Text style={recoveryTextStyle}>
                If you wish to keep your account, you can cancel the deletion process before <strong>{formattedDeletionDate}</strong>.
              </Text>
              <div style={recoveryLinkContainerStyle}>
                <a href={recoveryLink} style={recoveryLinkStyle}>
                  Cancel Account Deletion
                </a>
              </div>
              <Text style={recoveryNoteStyle}>
                Or copy this link to your browser:<br />
                <span style={linkTextStyle}>{recoveryLink}</span>
              </Text>
            </div>
          )}

          {/* Actions Required */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>📋 Action Required:</Text>
            <Text style={actionTextStyle}>
              {isUrgent 
                ? `To prevent permanent account deletion, you must take action within the next ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}.`
                : `You have ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining to decide whether to keep your account.`
              }
            </Text>
            {daysRemaining <= 3 && (
              <Text style={urgentActionStyle}>
                ⚠️ <strong>IMMEDIATE ACTION RECOMMENDED:</strong> Time is running out. We recommend taking action today.
              </Text>
            )}
          </div>

          {/* Support Information */}
          <div style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help?</Text>
            <Text style={supportTextStyle}>
              If you have questions or need assistance with your account, our support team is here to help:
            </Text>
            <ul style={listStyle}>
              <li style={listItemStyle}>
                Email: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
              </li>
              <li style={listItemStyle}>
                Response Time: Within 24 hours
              </li>
              <li style={listItemStyle}>
                Support Hours: Monday-Friday, 9AM-6PM EST
              </li>
            </ul>
          </div>

          {/* Important Notes */}
          {isUrgent && (
            <div style={importantNoteStyle}>
              <Text style={importantNoteTitleStyle}>⚠️ IMPORTANT NOTES:</Text>
              <Text style={importantNoteTextStyle}>
                1. This is your final reminder before permanent deletion<br />
                2. Account recovery is only possible before the scheduled deletion date<br />
                3. All data will be permanently erased after {formattedDeletionDate}<br />
                4. No further reminders will be sent
              </Text>
            </div>
          )}

          {/* Final Message */}
          <div style={footerSectionStyle}>
            <Text style={finalMessageStyle}>
              We value your presence in the Nomeo Realtors community and hope you choose to continue with us.
              If you decide to stay, we're committed to providing you with the best real estate experience.
            </Text>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerTextStyle}>
              The Nomeo Realtors Account Security Team
            </Text>
            <div style={separatorStyle} />
            <Text style={copyrightStyle}>
              © {new Date().getFullYear()} Nomeo Realtors. All rights reserved.
            </Text>
            <Text style={disclaimerStyle}>
              This is an automated message. Please do not reply to this email.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif, Helvetica',
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: 'antialiased',
  MsTextSizeAdjust: '100%'
};

const containerStyle = {
  padding: '20px',
  maxWidth: '600px',
  margin: '20px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0'
};

const headerContainerStyle = {
  textAlign: 'center' as const,
  marginBottom: '30px'
};

const headerStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '10px',
  paddingBottom: '15px',
  borderBottom: '3px solid #f0f0f0'
};

const urgentBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#d32f2f',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  marginTop: '10px'
};

const greetingStyle = {
  fontSize: '18px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '0 0 20px 0'
};

const mainTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 25px 0'
};

const urgencyCardStyle = {
  margin: '25px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  border: '2px solid #e9ecef'
};

const urgencyTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#d32f2f',
  marginBottom: '15px',
  textAlign: 'center' as const
};

const urgencyInfoStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px'
};

const urgencyItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '1px solid #e0e0e0'
};

const urgencyLabelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#666666'
};

const urgencyValueStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333'
};

const sectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
};

const accountDetailsStyle = {
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0'
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #f0f0f0'
};

const detailLabelStyle = {
  fontSize: '14px',
  color: '#666666',
  fontWeight: 'bold'
};

const detailValueStyle = {
  fontSize: '14px',
  color: '#333333',
  fontWeight: 'normal'
};

const messageSectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  border: '1px solid #d0e3ff'
};

const messageContentStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0'
};

const warningTextStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#d32f2f',
  margin: '0'
};

const recoveryTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 15px 0'
};

const recoveryLinkContainerStyle = {
  textAlign: 'center' as const,
  margin: '20px 0'
};

const recoveryLinkStyle = {
  display: 'inline-block',
  backgroundColor: '#4caf50',
  color: '#ffffff',
  padding: '14px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  transition: 'background-color 0.3s'
};

const recoveryNoteStyle = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '15px',
  lineHeight: '1.5'
};

const linkTextStyle = {
  color: '#1976d2',
  wordBreak: 'break-all' as const,
  display: 'inline-block',
  marginTop: '5px'
};

const actionTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0'
};

const urgentActionStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#d32f2f',
  backgroundColor: '#ffebee',
  padding: '12px',
  borderRadius: '6px',
  marginTop: '15px',
  borderLeft: '4px solid #d32f2f'
};

const supportSectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#e3f2fd',
  borderRadius: '8px',
  border: '1px solid #bbdefb'
};

const supportTextStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 15px 0'
};

const listStyle = {
  margin: '0',
  paddingLeft: '20px'
};

const listItemStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
  marginBottom: '8px'
};

const linkStyle = {
  color: '#1976d2',
  textDecoration: 'underline'
};

const importantNoteStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#ffebee',
  borderRadius: '8px',
  border: '2px solid #d32f2f'
};

const importantNoteTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#d32f2f',
  marginBottom: '15px'
};

const importantNoteTextStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#d32f2f',
  margin: '0'
};

const footerSectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  border: '1px solid #c8e6c9'
};

const finalMessageStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#2e7d32',
  fontStyle: 'italic',
  margin: '0',
  textAlign: 'center' as const
};

const footerStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '2px solid #e0e0e0',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '5px 0'
};

const separatorStyle = {
  height: '1px',
  backgroundColor: '#e0e0e0',
  margin: '15px 0'
};

const copyrightStyle = {
  fontSize: '12px',
  color: '#666666',
  margin: '5px 0'
};

const disclaimerStyle = {
  fontSize: '12px',
  color: '#999999',
  fontStyle: 'italic',
  margin: '5px 0'
};