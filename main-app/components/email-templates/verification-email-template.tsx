import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface EmailTemplateProps {
  username: string;
  title: string;
  otp: string;
  message: string;
}

export function VerificationEmailTemplate(props: EmailTemplateProps) {
  const { title, username, message, otp } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Verification Required
            </Text>
            <Text style={headerSubtitleStyle}>
              {title}
            </Text>
          </Section>

          {/* Welcome Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hello {username},
            </Text>
            <Text style={textStyle}>
              Welcome to Nomeo Realtors! {message}
            </Text>
          </Section>

          {/* OTP Highlight Section */}
          <Section style={otpSectionStyle}>
            <Text style={otpLabelStyle}>Your Verification Code:</Text>
            <Text style={otpCodeStyle}>
              {otp}
            </Text>
            <Text style={otpInstructionStyle}>
              Enter this code in the verification field to complete your process
            </Text>
          </Section>

          {/* Security Information */}
          <Section style={securitySectionStyle}>
            <Text style={labelStyle}>Security Notice:</Text>
            <Text style={textStyle}>
              • This code is valid for a limited time only<br />
              • Do not share this code with anyone<br />
              • Nomeo Realtors will never ask for your password<br />
              • If you didn&apos;t request this code, please ignore this email
            </Text>
          </Section>

          {/* Troubleshooting Section */}
          <Section style={helpSectionStyle}>
            <Text style={labelStyle}>Need Help?</Text>
            <Text style={textStyle}>
              If you&apos;re having trouble with the verification process or didn&apos;t request this code, 
              please contact our support team immediately at{' '}
              <a href="mailto:support@nomeorealtors.com" style={linkStyle}>
                support@nomeorealtors.com
              </a>
            </Text>
          </Section>

          {/* Welcome to Community */}
          <Section style={welcomeSectionStyle}>
            <Text style={welcomeTitleStyle}>Welcome to Our Community</Text>
            <Text style={textStyle}>
              We&apos;re excited to have you join thousands of real estate professionals 
              who trust Nomeo Realtors for their property needs and business growth.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerTextStyle}>
              The Nomeo Realtors Team
            </Text>
            <Text style={footerNoteStyle}>
              Securing your real estate journey
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Consistent styling with your other templates
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

const headerSectionStyle = {
  padding: '20px',
  backgroundColor: '#4caf50',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
  marginBottom: '20px'
};

const headerTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 10px 0',
  lineHeight: '1.4'
};

const headerSubtitleStyle = {
  fontSize: '18px',
  color: '#e8f5e9',
  margin: '0',
  lineHeight: '1.4',
  fontWeight: 'normal'
};

const sectionStyle = {
  margin: '20px 0',
  padding: '0'
};

const greetingStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0'
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '10px 0'
};

const otpSectionStyle = {
  margin: '25px 0',
  padding: '25px',
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  border: '2px solid #1976d2',
  textAlign: 'center' as const
};

const otpLabelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1976d2',
  margin: '0 0 15px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px'
};

const otpCodeStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1565c0',
  margin: '15px 0',
  letterSpacing: '8px',
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  border: '2px dashed #1976d2'
};

const otpInstructionStyle = {
  fontSize: '14px',
  color: '#666666',
  margin: '15px 0 0 0',
  fontStyle: 'italic'
};

const securitySectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  borderLeft: '4px solid #ff9800'
};

const helpSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const welcomeSectionStyle = {
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
  marginBottom: '12px'
};

const welcomeTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#2e7d32',
  marginBottom: '10px'
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

const footerNoteStyle = {
  fontSize: '14px',
  fontStyle: 'italic',
  color: '#999999',
  margin: '10px 0 0 0'
};