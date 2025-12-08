import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface AdminDeactivationEmailProps {
  type: 'deactivation' | 'reactivation' | 'permanent_deletion';
  name: string;
  adminRole: string;
  reason: string;
  deactivationDate?: string;
  deactivatedBy?: string;
  contactEmail?: string;
  isPermanent?: boolean;
  reactivationDate?: string;
  appealDeadline?: string;
}

export function AdminDeactivationEmailTemplate(props: AdminDeactivationEmailProps) {
  const { 
    type, 
    name, 
    adminRole,
    reason, 
    deactivationDate, 
    deactivatedBy = 'System Administrator',
    contactEmail = 'support@nomeorealtors.com',
    isPermanent = false,
    reactivationDate,
    appealDeadline
  } = props;

  const getEmailTitle = () => {
    switch (type) {
      case 'deactivation':
        return isPermanent ? 'Admin Account Permanently Deactivated' : 'Admin Account Temporarily Deactivated';
      case 'reactivation':
        return 'Admin Account Reactivated';
      case 'permanent_deletion':
        return 'Admin Account Permanently Deleted';
      default:
        return 'Account Status Update';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'deactivation':
      case 'permanent_deletion':
        return '#d32f2f'; // Red for deactivations
      case 'reactivation':
        return '#2e7d32'; // Green for reactivations
      default:
        return '#1976d2'; // Blue for neutral
    }
  };

  const getMainText = () => {
    switch (type) {
      case 'deactivation':
        if (isPermanent) {
          return `We regret to inform you that your Nomeo Realtors admin account has been permanently deactivated effective `;
        } else {
          return `Your Nomeo Realtors admin account has been temporarily deactivated effective `;
        }
      case 'reactivation':
        return `We are pleased to inform you that your admin account has been reactivated effective `;
      case 'permanent_deletion':
        return `Your Nomeo Realtors admin account has been permanently deleted from our system effective `;
      default:
        return '';
    }
  };

  const getWhatThisMeans = () => {
    switch (type) {
      case 'deactivation':
        if (isPermanent) {
          return (
            <>
              • Your admin access has been permanently revoked<br />
              • You will no longer be able to access the admin dashboard<br />
              • All admin privileges have been removed<br />
              • Your user account remains active for platform access
            </>
          );
        } else {
          return (
            <>
              • Your admin access has been temporarily suspended<br />
              • You cannot access the admin dashboard during this period<br />
              • Your user account remains active for platform access<br />
              • Admin privileges will be restored upon reactivation
            </>
          );
        }
      case 'reactivation':
        return (
          <>
            • Your admin access has been fully restored<br />
            • You can now access the admin dashboard<br />
            • All admin privileges have been reinstated<br />
            • Please review admin guidelines for future compliance
          </>
        );
      case 'permanent_deletion':
        return (
          <>
            • Your admin account has been permanently removed<br />
            • All admin access and privileges have been revoked<br />
            • Your user account remains active for platform access<br />
            • This action cannot be undone
          </>
        );
      default:
        return '';
    }
  };

  const showAppealInfo = () => {
    return type === 'deactivation' && !isPermanent && appealDeadline;
  };

  const showReactivationInfo = () => {
    return type === 'deactivation' && !isPermanent && reactivationDate;
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
            {deactivationDate && <strong> {deactivationDate}</strong>}
            {type === 'reactivation' && reactivationDate && <strong> {reactivationDate}</strong>}
          </Text>

          {/* Admin Role Information */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>Admin Role:</Text>
            <Text style={valueStyle}>{adminRole}</Text>
          </div>

          {/* Reason Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>
              {type === 'reactivation' ? 'Reactivation Notes:' : 'Reason for Deactivation:'}
            </Text>
            <Text style={valueStyle}>{reason}</Text>
          </div>

          {/* Deactivated By (for deactivations) */}
          {(type === 'deactivation' || type === 'permanent_deletion') && (
            <div style={sectionStyle}>
              <Text style={labelStyle}>Action Taken By:</Text>
              <Text style={valueStyle}>{deactivatedBy}</Text>
            </div>
          )}

          {/* Reactivation Date (for temporary deactivations) */}
          {showReactivationInfo() && (
            <div style={{...sectionStyle, borderLeft: '4px solid #ff9800'}}>
              <Text style={labelStyle}>Scheduled Reactivation:</Text>
              <Text style={textStyle}>
                Your admin access is scheduled to be automatically reactivated on <strong>{reactivationDate}</strong>.
              </Text>
            </div>
          )}

          {/* Appeal Information */}
          {showAppealInfo() && (
            <div style={{...sectionStyle, borderLeft: '4px solid #1976d2'}}>
              <Text style={labelStyle}>Appeal Process:</Text>
              <Text style={textStyle}>
                If you wish to appeal this decision, you must submit your appeal by <strong>{appealDeadline}</strong>.
                Please contact our support team with any additional information or documentation.
              </Text>
            </div>
          )}

          {/* What This Means Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>What This Means:</Text>
            <Text style={textStyle}>
              {getWhatThisMeans()}
            </Text>
          </div>

          {/* Next Steps */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>Next Steps:</Text>
            <Text style={textStyle}>
              {type === 'deactivation' ? (
                isPermanent ? (
                  <>If you have questions about this permanent deactivation, please contact our support team.</>
                ) : (
                  <>You will receive a notification when your admin access is reactivated. For immediate concerns, contact support.</>
                )
              ) : type === 'reactivation' ? (
                <>Please ensure you review the admin guidelines. Contact support if you encounter any access issues.</>
              ) : (
                <>If you have questions about this permanent deletion, please contact our support team.</>
              )}
            </Text>
            <Text style={textStyle}>
              Contact Support: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
            </Text>
          </div>

          {/* Additional message for reactivation */}
          {type === 'reactivation' && (
            <div style={{...sectionStyle, borderLeft: '4px solid #2e7d32'}}>
              <Text style={labelStyle}>Welcome Back!</Text>
              <Text style={textStyle}>
                We're glad to have you back as part of our admin team. Please ensure you're familiar with our latest 
                admin policies and guidelines to ensure smooth operations.
              </Text>
            </div>
          )}

          {/* Footer */}
          <div style={footerStyle}>
            <Text style={textStyle}>
              Best regards,
            </Text>
            <Text style={textStyle}>
              The Nomeo Realtors Admin Team
            </Text>
            <Text style={{...textStyle, fontSize: '14px', color: '#666'}}>
              This is an automated notification. Please do not reply to this email.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (similar to your existing ones)
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