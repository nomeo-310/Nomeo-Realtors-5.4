import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface AccountDeletionEmailProps {
  type: 'user_deletion' | 'admin_deletion' | 'admin_complete_deletion';
  name: string;
  reason: string;
  previousRole?: string; 
  contactEmail?: string;
  userRole?: string; 
}

export function AccountDeletionEmailTemplate(props: AccountDeletionEmailProps) {
  const { 
    type, 
    name, 
    reason, 
    previousRole, 
    contactEmail = 'support@nomeorealtors.com',
    userRole = 'user'
  } = props;

  const getEmailTitle = () => {
    switch (type) {
      case 'user_deletion':
        return 'Account Permanently Deleted';
      case 'admin_deletion':
        return 'Admin Privileges Removed';
      case 'admin_complete_deletion':
        return 'Account Permanently Deleted';
      default:
        return 'Account Update';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'user_deletion':
      case 'admin_complete_deletion':
        return '#d32f2f'; // Red for permanent deletion
      case 'admin_deletion':
        return '#ff9800'; // Orange for admin removal with role revert
      default:
        return '#1976d2';
    }
  };

  const getMainText = () => {
    switch (type) {
      case 'user_deletion':
        return `We regret to inform you that your Nomeo Realtors account has been permanently deleted.`;
      case 'admin_deletion':
        return `We would like to inform you that your admin privileges have been removed from the Nomeo Realtors platform.`;
      case 'admin_complete_deletion':
        return `We regret to inform you that your Nomeo Realtors admin account has been permanently deleted.`;
      default:
        return '';
    }
  };

  const getAccountStatus = () => {
    switch (type) {
      case 'user_deletion':
        return (
          <>
            • Your account has been permanently deleted from our system<br />
            • All your personal data, listings, and account information have been removed<br />
            • You will no longer be able to access Nomeo Realtors services<br />
            • This action is irreversible and permanent<br />
            • If you wish to use our platform again, you will need to create a new account
          </>
        );
      case 'admin_deletion':
        return (
          <>
            • Your admin privileges have been revoked<br />
            • Your account has been reverted to your previous role: <strong>{previousRole || 'User'}</strong><br />
            • You can still access the platform with your regular account<br />
            • All your personal data and listings are preserved<br />
            • You will have access to frontend features available to {previousRole || 'user'} accounts
          </>
        );
      case 'admin_complete_deletion':
        return (
          <>
            • Your admin account has been permanently deleted from our system<br />
            • All your personal data, admin privileges, and account information have been removed<br />
            • You will no longer be able to access Nomeo Realtors services<br />
            • This action is irreversible and permanent<br />
            • If you wish to use our platform in the future, you will need to create a new account
          </>
        );
      default:
        return '';
    }
  };

  const getNextSteps = () => {
    switch (type) {
      case 'user_deletion':
      case 'admin_complete_deletion':
        return (
          <>
            If you believe this deletion was made in error, or if you have any questions about this action, 
            please contact our support team immediately. However, please note that account deletions are 
            typically permanent and cannot be reversed.
          </>
        );
      case 'admin_deletion':
        return (
          <>
            If you have questions about why your admin privileges were removed, or if you believe this 
            was done in error, please contact our support team for clarification.
          </>
        );
      default:
        return '';
    }
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

  const showFrontendAccessNote = () => {
    return type === 'admin_deletion';
  };

  const getFinalMessage = () => {
    switch (type) {
      case 'user_deletion':
        return 'We thank you for having been part of the Nomeo Realtors community and wish you the best in your future endeavors.';
      case 'admin_deletion':
        return 'We appreciate your previous contributions as an administrator and look forward to your continued participation in our community as a regular user.';
      case 'admin_complete_deletion':
        return 'We thank you for your service as an administrator and wish you the best in your future endeavors.';
      default:
        return '';
    }
  };

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with dynamic color */}
          <Text style={{ ...headerStyle, color: getTitleColor() }}>
            {getEmailTitle()}
          </Text>

          <Text style={textStyle}>
            Dear {name},
          </Text>

          <Text style={textStyle}>
            {getMainText()}
          </Text>

          {/* Reason Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>
              {type === 'user_deletion' || type === 'admin_complete_deletion' 
                ? 'Reason for Deletion:' 
                : 'Reason for Admin Privilege Removal:'}
            </Text>
            <Text style={valueStyle}>{reason}</Text>
          </div>

          {/* Account Status Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>
              {type === 'user_deletion' || type === 'admin_complete_deletion' 
                ? 'Account Status:' 
                : 'Current Account Status:'}
            </Text>
            <Text style={textStyle}>
              {getAccountStatus()}
            </Text>
          </div>

          {/* Additional info for admin reverts */}
          {type === 'admin_deletion' && previousRole && (
            <div style={{...sectionStyle, borderLeft: '4px solid #ff9800'}}>
              <Text style={labelStyle}>Your New Access Level:</Text>
              <Text style={textStyle}>
                Your account has been successfully reverted to <strong>{getRoleDisplayName(previousRole)}</strong> status. 
                You can now access all features available to {previousRole === 'user' ? 'regular users' : previousRole + 's'} 
                on our platform. Your login credentials remain the same.
              </Text>
            </div>
          )}

          {/* Frontend access note for reverted admins */}
          {showFrontendAccessNote() && (
            <div style={{...sectionStyle, backgroundColor: '#f0f7ff', border: '1px solid #d0e3ff'}}>
              <Text style={labelStyle}>Platform Access:</Text>
              <Text style={textStyle}>
                <strong>You can continue using the Nomeo Realtors web application</strong> with your existing login credentials. 
                You'll have access to all standard features available to {previousRole || 'user'} accounts, including 
                {previousRole === 'agent' ? ' property listings, client management, and agent tools.' : ' browsing properties, saving favorites, and user profile management.'}
              </Text>
            </div>
          )}

          {/* Next Steps Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>Next Steps:</Text>
            <Text style={textStyle}>
              {getNextSteps()}
            </Text>
            <Text style={textStyle}>
              You can reach us at: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
            </Text>
          </div>

          {/* Final message based on type */}
          <div style={footerSectionStyle}>
            <Text style={textStyle}>
              {getFinalMessage()}
            </Text>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <Text style={textStyle}>
              Best regards,
            </Text>
            <Text style={textStyle}>
              The Nomeo Realtors Team
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styles remain the same as previous version
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

const headerStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  paddingBottom: '10px',
  borderBottom: '2px solid #f0f0f0',
  textAlign: 'center' as const
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '10px 0'
};

const sectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const footerSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffe0b2'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '8px'
};

const valueStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  backgroundColor: '#ffffff',
  padding: '12px',
  borderRadius: '4px',
  borderLeft: '4px solid #1976d2'
};

const linkStyle = {
  color: '#1976d2',
  textDecoration: 'underline'
};

const footerStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0'
};