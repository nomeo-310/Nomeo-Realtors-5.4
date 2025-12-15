import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
}

export function TemporaryDeleteEmailTemplate(props: EmailTemplateProps) {
  const { name } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Account Temporarily Deleted
            </Text>
            <Text style={headerSubtitleStyle}>
              Your account has been deactivated as requested
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Dear {name},
            </Text>
            <Text style={textStyle}>
              We wanted to let you know that your Nomeo Realtors account has been temporarily deleted as per your request. 
              This means your account is currently inactive, but you still have 30 days to restore it before it is permanently deleted.
            </Text>
          </Section>

          {/* Restoration Instructions */}
          <Section style={infoSectionStyle}>
            <Text style={labelStyle}>How to Restore Your Account:</Text>
            <Text style={textStyle}>
              If you change your mind, simply return to the Nomeo Realtors app or website and try to create a new account using the same email address and details you used before. 
              Your account will be automatically restored, and you can continue using it as usual with all your data intact.
            </Text>
          </Section>

          {/* Timeline Section */}
          <Section style={timelineSectionStyle}>
            <Text style={labelStyle}>Important Timeline:</Text>
            <Text style={textStyle}>
              • <strong>Now:</strong> Account is temporarily deleted and inactive<br />
              • <strong>Next 30 days:</strong> You can restore your account at any time<br />
              • <strong>After 30 days:</strong> Account and all data will be permanently deleted
            </Text>
          </Section>

          {/* Permanent Deletion Warning */}
          <Section style={warningSectionStyle}>
            <Text style={warningTitleStyle}>What Happens After 30 Days?</Text>
            <Text style={textStyle}>
              If you do not restore your account within 30 days, it will be permanently deleted from our system. 
              This action is irreversible and will result in the complete removal of:
              <br /><br />
              • Your personal profile information<br />
              • Any saved properties or favorites<br />
              • Message history and conversations<br />
              • Account preferences and settings
            </Text>
          </Section>

          {/* Support Section */}
          <Section style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help or Have Questions?</Text>
            <Text style={textStyle}>
              If you have any questions about this process, need assistance restoring your account, 
              or want to understand what data will be affected, our support team is here to help.
            </Text>
            <Text style={textStyle}>
              Contact us at: <a href="mailto:support@nomeorealtors.com" style={linkStyle}>support@nomeorealtors.com</a>
            </Text>
          </Section>

          {/* Appreciation Section */}
          <Section style={appreciationSectionStyle}>
            <Text style={textStyle}>
              Thank you for being a part of the Nomeo Realtors community. We hope to see you again soon.
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
              We&apos;re here when you&apos;re ready to return
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
  backgroundColor: '#ff9800',
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
  fontSize: '16px',
  color: '#fff3e0',
  margin: '0',
  lineHeight: '1.4'
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

const infoSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f7ff',
  borderRadius: '6px',
  border: '1px solid #d0e3ff',
  borderLeft: '4px solid #2196f3'
};

const timelineSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const warningSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#ffebee',
  borderRadius: '6px',
  border: '1px solid #ffcdd2',
  borderLeft: '4px solid #f44336'
};

const warningTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#d32f2f',
  marginBottom: '12px'
};

const supportSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9'
};

const appreciationSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  textAlign: 'center' as const
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
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