import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
  message: string;
  email: string;
  phoneNumber?: string;
}

export function ContactEmailTemplate(props: EmailTemplateProps) {
  const { name, message, email, phoneNumber } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              New Contact Message
            </Text>
            <Text style={headerSubtitleStyle}>
              You've received a new message from your website
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={sectionStyle}>
            <Text style={labelStyle}>Contact Details:</Text>
            <Section style={detailsSectionStyle}>
              <Text style={detailItemStyle}>
                <strong>Name:</strong> {name}
              </Text>
              <Text style={detailItemStyle}>
                <strong>Email:</strong> {email}
              </Text>
              {phoneNumber && (
                <Text style={detailItemStyle}>
                  <strong>Phone:</strong> {phoneNumber}
                </Text>
              )}
            </Section>
          </Section>

          {/* Message Content */}
          <Section style={sectionStyle}>
            <Text style={labelStyle}>Message:</Text>
            <Section style={messageSectionStyle}>
              <Text style={messageTextStyle}>
                {message}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              This message was sent through the Nomeo Realtors contact form
            </Text>
            <Text style={footerNoteStyle}>
              Received on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
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
  backgroundColor: '#2196f3',
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
  color: '#e3f2fd',
  margin: '0',
  lineHeight: '1.4'
};

const sectionStyle = {
  margin: '20px 0',
  padding: '0'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
};

const detailsSectionStyle = {
  margin: '10px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const detailItemStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '8px 0'
};

const messageSectionStyle = {
  margin: '10px 0',
  padding: '20px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  borderLeft: '4px solid #ff9800'
};

const messageTextStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0',
  whiteSpace: 'pre-wrap' as const
};

const footerStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666666',
  margin: '5px 0'
};

const footerNoteStyle = {
  fontSize: '12px',
  fontStyle: 'italic',
  color: '#999999',
  margin: '5px 0 0 0'
};