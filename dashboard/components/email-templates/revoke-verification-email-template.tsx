import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface VerificationRevokedEmailProps {
  name: string;
  reason: string;
  userType: string;
  contactEmail?: string;
}

export function RevokeVerificationEmailTemplate(props: VerificationRevokedEmailProps) {
  const { name, reason, userType, contactEmail = 'support@nomeorealtors.com' } = props;

  const getUserTypeDisplay = () => {
    return userType === 'agent' ? 'Real Estate Agent' : 'User';
  };

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={{ ...headerStyle, color: '#d32f2f' }}>
            Account Verification Revoked
          </Text>

          <Text style={textStyle}>
            Dear {name},
          </Text>

          <Text style={textStyle}>
            We are writing to inform you that your {getUserTypeDisplay()} account verification 
            with Nomeo Realtors has been revoked.
          </Text>

          <Section style={sectionStyle}>
            <Text style={labelStyle}>Reason for Revocation:</Text>
            <Text style={valueStyle}>{reason}</Text>
          </Section>

          <Section style={sectionStyle}>
            <Text style={labelStyle}>What This Means:</Text>
            <Text style={textStyle}>
              • Your account verification status has been removed<br />
              • You will need to complete your profile setup again<br />
              • Your account access may be limited until re-verification<br />
              {userType === 'agent' && (
                <>
                  • Your property listings have been temporarily hidden<br />
                  • You will need to resubmit agent verification documents<br />
                </>
              )}
              • Some platform features may be restricted
            </Text>
          </Section>

          <Section style={sectionStyle}>
            <Text style={labelStyle}>Next Steps:</Text>
            <Text style={textStyle}>
              To restore your account verification, please log in to your account and 
              complete the profile setup process again. You may need to provide updated 
              information and documentation.
            </Text>
            <Text style={textStyle}>
              If you have any questions or believe this was done in error, please contact our support team.
            </Text>
          </Section>

          <Section style={actionSectionStyle}>
            <Text style={actionTextStyle}>
              <strong>Action Required:</strong> Please complete your profile setup to restore your account verification.
            </Text>
          </Section>

          <Section style={footerSectionStyle}>
            <Text style={textStyle}>
              You can reach our support team at:{' '}
              <a href={`mailto:${contactEmail}`} style={linkStyle}>
                {contactEmail}
              </a>
            </Text>
          </Section>

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerTextStyle}>
              The Nomeo Realtors Team
            </Text>
          </Section>
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

const actionSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  borderLeft: '4px solid #ff9800'
};

const footerSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9'
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
  borderLeft: '4px solid #d32f2f'
};

const actionTextStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#e65100',
  fontWeight: 'bold',
  margin: '10px 0'
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

const footerTextStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#666666',
  margin: '5px 0'
};