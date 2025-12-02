import * as React from 'react';
import { Html, Head, Body, Text, Container, Section, Link } from '@react-email/components';

interface UserMessageEmailProps {
  userName: string;
  subject: string;
  message: string;
  senderName: string;
  isUrgent?: boolean;
  userType: string;
}

export function UserMessageEmailTemplate(props: UserMessageEmailProps) {
  const { userName, subject, message, senderName, isUrgent, userType } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Message from Nomeo Realtors
            </Text>
            {isUrgent && (
              <Text style={urgentBadgeStyle}>
                URGENT
              </Text>
            )}
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hello {userName},
            </Text>
            <Text style={textStyle}>
              You have received a {isUrgent ? 'urgent ' : ''}message from {senderName} at Nomeo Realtors.
            </Text>
          </Section>

          {/* Message Content */}
          <Section style={messageSectionStyle}>
            <Text style={labelStyle}>Subject: {subject}</Text>
            <Section style={messageContentStyle}>
              <Text style={messageTextStyle}>
                {message}
              </Text>
            </Section>
          </Section>

          {/* User Type Specific Info */}
          <Section style={infoSectionStyle}>
            <Text style={labelStyle}>
              {userType === 'agent' ? 'Agent Information' : 
               userType === 'admin' ? 'Administrative Notice' : 
               'Account Information'}
            </Text>
            <Text style={textStyle}>
              {userType === 'agent' && 
                'This message pertains to your agency account and properties.'}
              {userType === 'admin' && 
                'This is an administrative message regarding platform management.'}
              {userType === 'user' && 
                'This message is regarding your account and activities on our platform.'}
            </Text>
          </Section>

          {/* Support Section */}
          <Section style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help?</Text>
            <Text style={textStyle}>
              If you have any questions or need assistance, please contact our support team:
            </Text>
            <Text style={textStyle}>
              Email: <Link href="mailto:support@nomeorealtors.com" style={linkStyle}>
                support@nomeorealtors.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
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

// Styles (similar to your existing styles)
const bodyStyle = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const headerSectionStyle = {
  padding: '30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textAlign: 'center' as const
};

const headerTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 10px 0'
};

const urgentBadgeStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#f56565',
  color: '#ffffff',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const sectionStyle = {
  padding: '30px'
};

const greetingStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 16px 0'
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0 0 16px 0'
};

const messageSectionStyle = {
  padding: '30px',
  backgroundColor: '#f7fafc'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 12px 0'
};

const messageContentStyle = {
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '16px 0'
};

const messageTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0',
  whiteSpace: 'pre-wrap'
};

const infoSectionStyle = {
  padding: '30px',
  backgroundColor: '#f0fff4',
  borderLeft: '4px solid #48bb78'
};

const actionsSectionStyle = {
  padding: '30px',
  textAlign: 'center' as const
};

const buttonStyle = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 8px',
  display: 'inline-block'
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#a0aec0',
  color: '#ffffff'
};

const supportSectionStyle = {
  padding: '30px',
  backgroundColor: '#ebf8ff',
  borderLeft: '4px solid #4299e1'
};

const linkStyle = {
  color: '#4299e1',
  textDecoration: 'underline'
};

const footerStyle = {
  padding: '30px',
  backgroundColor: '#2d3748',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '16px',
  color: '#e2e8f0',
  margin: '0 0 8px 0'
};

const footerSignatureStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0'
};