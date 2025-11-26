import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface AccountSuspendedEmailProps {
  type: 'suspension' | 'lift' | 'extension' | 'appeal' | 'appeal_approved' | 'appeal_rejected' | 'auto_lift';
  name: string;
  reason: string;
  category?: string; 
  suspensionDate?: string; 
  contactEmail?: string;
  isExtended?: boolean; 
  suspensionDuration?: string; 
}

export function AccountSuspendedEmailTemplate(props: AccountSuspendedEmailProps) {
  const { 
    type, 
    name, 
    reason, 
    category, 
    suspensionDate, 
    contactEmail = 'support@nomeorealtors.com', 
    isExtended = false,
    suspensionDuration 
  } = props;

  const getCategoryDisplayName = (cat: string) => {
    const categoryMap: Record<string, string> = {
      'policy_violation': 'Policy Violation',
      'suspicious_activity': 'Suspicious Activity',
      'payment_issues': 'Payment Issues',
      'content_violation': 'Content Violation',
      'security_concerns': 'Security Concerns',
      'behavioral_issues': 'Behavioral Issues',
      'other': 'Other'
    };
    return categoryMap[cat] || cat;
  };

  const getEmailTitle = () => {
    switch (type) {
      case 'suspension':
        return isExtended ? 'Suspension Extended' : 'Account Suspended';
      case 'extension':
        return 'Suspension Extended';
      case 'lift':
        return 'Suspension Lifted';
      case 'appeal_approved':
        return 'Appeal Approved - Suspension Lifted';
      case 'appeal_rejected':
        return 'Appeal Rejected';
      default:
        return 'Account Notification';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'suspension':
      case 'extension':
      case 'appeal_rejected':
        return '#d32f2f'; // Red for negative actions
      case 'lift':
      case 'appeal_approved':
        return '#2e7d32'; // Green for positive actions
      default:
        return '#1976d2'; // Blue for neutral
    }
  };

  const getMainText = () => {
    switch (type) {
      case 'suspension':
        if (isExtended) {
          return `We would like to inform you that your suspension has been extended until `;
        } else {
          return `We regret to inform you that your Nomeo Realtors account has been suspended effective `;
        }
      case 'extension':
        return `We would like to inform you that your suspension has been extended until `;
      case 'lift':
        return `We are pleased to inform you that your suspension has been lifted effective immediately.`;
      case 'appeal_approved':
        return `We are pleased to inform you that your appeal has been approved and your suspension has been lifted effective immediately.`;
      case 'appeal_rejected':
        return `We regret to inform you that your appeal has been reviewed and rejected.`;
      default:
        return '';
    }
  };

  const getReasonLabel = () => {
    switch (type) {
      case 'suspension':
      case 'extension':
        return 'Reason for Suspension:';
      case 'lift':
        return 'Reason for Lift:';
      case 'appeal_approved':
        return 'Appeal Approval Notes:';
      case 'appeal_rejected':
        return 'Appeal Rejection Notes:';
      default:
        return 'Reason:';
    }
  };

  const getWhatThisMeans = () => {
    switch (type) {
      case 'suspension':
      case 'extension':
        return (
          <>
            • Your account access has been temporarily restricted<br />
            • You will not be able to log in or use Nomeo Realtors services<br />
            • Your listings and data are preserved during the suspension period<br />
            • You can still view your account information but cannot perform actions
          </>
        );
      case 'lift':
      case 'appeal_approved':
        return (
          <>
            • Your account access has been fully restored<br />
            • You can now log in and use all Nomeo Realtors services<br />
            • Your listings and data are available as before<br />
            • All account functionalities have been reinstated
          </>
        );
      case 'appeal_rejected':
        return (
          <>
            • Your account remains suspended according to the original terms<br />
            • You will not be able to log in or use Nomeo Realtors services<br />
            • Your listings and data remain preserved<br />
            • You may submit another appeal after reviewing the rejection notes
          </>
        );
      default:
        return '';
    }
  };

  const showNextSteps = () => {
    return type === 'suspension' || type === 'extension' || type === 'appeal_rejected';
  };

  const getNextStepsText = () => {
    if (type === 'appeal_rejected') {
      return (
        <>
          If you have additional information or would like to submit another appeal, 
          please review the rejection notes above and contact our support team.
        </>
      );
    } else {
      return (
        <>
          If you believe this suspension was made in error, or if you would like to appeal this decision,
          please contact our support team for further assistance.
        </>
      );
    }
  };

  const showSuspensionDetails = () => {
    return (type === 'suspension' || type === 'extension') && category;
  };

  const showDateAndDuration = () => {
    return (type === 'suspension' || type === 'extension') && suspensionDate;
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
            {showDateAndDuration() && (
              <strong> {suspensionDate}</strong>
            )}
            {suspensionDuration && (type === 'suspension' || type === 'extension') && !isExtended && (
              <span> for a duration of <strong>{suspensionDuration}</strong></span>
            )}
            {type === 'suspension' && isExtended && suspensionDuration && (
              <span> with a new duration of <strong>{suspensionDuration}</strong></span>
            )}
          </Text>

          {/* Suspension Details - Only for suspensions and extensions */}
          {showSuspensionDetails() && (
            <div style={sectionStyle}>
              <Text style={labelStyle}>Suspension Category:</Text>
              <Text style={valueStyle}>{getCategoryDisplayName(category!)}</Text>
            </div>
          )}

          {/* Reason Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>
              {getReasonLabel()}
            </Text>
            <Text style={valueStyle}>{reason}</Text>
          </div>

          {/* What This Means Section */}
          <div style={sectionStyle}>
            <Text style={labelStyle}>What This Means:</Text>
            <Text style={textStyle}>
              {getWhatThisMeans()}
            </Text>
          </div>

          {/* Next Steps - For suspensions, extensions, and appeal rejections */}
          {showNextSteps() && (
            <div style={sectionStyle}>
              <Text style={labelStyle}>Next Steps:</Text>
              <Text style={textStyle}>
                {getNextStepsText()}
              </Text>
              <Text style={textStyle}>
                You can reach us at: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
              </Text>
              <Text style={{ ...textStyle, fontSize: '14px', color: '#666' }}>
                Please include your account email and any relevant details in your communication.
              </Text>
            </div>
          )}

          {/* Additional message for appeal approved */}
          {type === 'appeal_approved' && (
            <div style={{...sectionStyle, borderLeft: '4px solid #2e7d32'}}>
              <Text style={labelStyle}>Welcome Back!</Text>
              <Text style={textStyle}>
                We're glad to have you back in our community. Please ensure you review our community guidelines 
                to prevent future issues. If you have any questions, don't hesitate to contact our support team.
              </Text>
            </div>
          )}

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