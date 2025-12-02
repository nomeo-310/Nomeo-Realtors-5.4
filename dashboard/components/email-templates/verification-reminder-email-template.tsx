// components/emails/VerificationReminderEmail.tsx
import * as React from 'react';
import { Html, Head, Body, Text, Container, Section, Button, Link } from '@react-email/components';

interface VerificationReminderEmailProps {
  userName: string;
  userType: string;
  subject: string;
  message: string;
  reminderType: string;
  includeVerificationLink: boolean;
}

export function VerificationReminderEmailTemplate(props: VerificationReminderEmailProps) {
  const { userName, userType, subject, message, reminderType, includeVerificationLink } = props;

  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-account`;

  const getReminderTitle = () => {
    switch (reminderType) {
      case 'urgent':
        return 'Urgent Verification Required';
      case 'friendly':
        return 'Friendly Verification Reminder';
      case 'welcome':
        return 'Welcome to Nomeo Realtors';
      case 'feature':
        return 'Unlock All Features';
      default:
        return 'Account Verification Reminder';
    }
  };

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              {getReminderTitle()}
            </Text>
            <Text style={headerSubtitleStyle}>
              {reminderType === 'urgent' ? 'Action Required' : 'Complete Your Setup'}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hello {userName},
            </Text>
            <Text style={textStyle}>
              {reminderType === 'urgent' && 
                'This is an urgent reminder to complete your account verification to maintain full access to our platform.'}
              {reminderType === 'friendly' && 
                'This is a friendly reminder to complete your account verification and unlock all features.'}
              {reminderType === 'welcome' && 
                'Welcome to Nomeo Realtors! Please complete your verification to get started.'}
              {reminderType === 'feature' && 
                'Unlock all features by completing your account verification!'}
            </Text>
          </Section>

          {/* Message Content */}
          <Section style={messageSectionStyle}>
            <Text style={messageTextStyle}>
              {message}
            </Text>
          </Section>

          {/* Verification CTA */}
          {includeVerificationLink && (
            <Section style={ctaSectionStyle}>
              <Text style={labelStyle}>
                Complete Your Verification
              </Text>
              <Text style={textStyle}>
                Click the button below to verify your account and unlock all platform features:
              </Text>
              <Button 
                href={verificationLink}
                style={buttonStyle}
              >
                Verify Your Account
              </Button>
              <Text style={textStyle}>
                Or copy this link: {verificationLink}
              </Text>
            </Section>
          )}

          {/* Benefits */}
          <Section style={benefitsSectionStyle}>
            <Text style={labelStyle}>Benefits of Verification:</Text>
            <Text style={textStyle}>
              • Full access to platform features<br />
              • Enhanced security for your account<br />
              • Ability to connect with other users<br />
              • Priority support access<br />
              • Complete profile visibility
            </Text>
          </Section>

          {/* Support */}
          <Section style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help With Verification?</Text>
            <Text style={textStyle}>
              If you're having trouble with the verification process or have any questions, 
              our support team is here to help you:
            </Text>
            <Text style={textStyle}>
              Email: <Link href="mailto:support@nomeorealtors.com" style={linkStyle}>
                support@nomeorealtors.com
              </Link>
            </Text>
            <Text style={textStyle}>
              We're available to assist you with any issues you might encounter during the verification process.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Thank you for choosing Nomeo Realtors!
            </Text>
            <Text style={footerSignatureStyle}>
              The Nomeo Realtors Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// All the styles from above go here...
const bodyStyle = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Arial, sans-serif, Helvetica',
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: 'antialiased',
  MsTextSizeAdjust: '100%'
};

const containerStyle = {
  padding: '0',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const headerSectionStyle = {
  padding: '40px 30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textAlign: 'center' as const
};

const headerTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 10px 0',
  lineHeight: '1.3'
};

const headerSubtitleStyle = {
  fontSize: '16px',
  color: '#f0f0f0',
  margin: '0',
  lineHeight: '1.4'
};

const sectionStyle = {
  padding: '30px'
};

const greetingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 20px 0'
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0 0 16px 0'
};

const messageSectionStyle = {
  padding: '30px',
  backgroundColor: '#f7fafc',
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0'
};

const messageTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0',
  whiteSpace: 'pre-wrap'
};

const ctaSectionStyle = {
  padding: '40px 30px',
  backgroundColor: '#f0fff4',
  textAlign: 'center' as const,
  borderLeft: '4px solid #48bb78'
};

const labelStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 20px 0'
};

const buttonStyle = {
  backgroundColor: '#48bb78',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-block',
  margin: '0 0 20px 0',
  boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)'
};

const benefitsSectionStyle = {
  padding: '30px',
  backgroundColor: '#f7fafc',
  borderLeft: '4px solid #667eea'
};

const supportSectionStyle = {
  padding: '30px',
  backgroundColor: '#ebf8ff',
  borderLeft: '4px solid #4299e1'
};

const linkStyle = {
  color: '#4299e1',
  textDecoration: 'underline',
  fontWeight: 'bold'
};

const footerStyle = {
  padding: '30px',
  backgroundColor: '#2d3748',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#e2e8f0',
  margin: '0 0 10px 0'
};

const footerSignatureStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '20px 0 0 0'
};