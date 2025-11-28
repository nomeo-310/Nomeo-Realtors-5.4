// emails/permanent-delete-email.tsx
import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface PermanentDeleteEmailProps {
  name: string;
  userType: string;
}

export function PermanentDeleteEmailTemplate(props: PermanentDeleteEmailProps) {
  const { name, userType } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={{ ...headerStyle, color: '#d32f2f' }}>
            Account Permanently Deleted
          </Text>

          <Text style={textStyle}>
            Dear {name},
          </Text>

          <Text style={textStyle}>
            We confirm that your {userType === 'agent' ? 'agent' : 'user'} account has been permanently deleted from Nomeo Realtors.
          </Text>

          <div style={sectionStyle}>
            <Text style={labelStyle}>What This Means:</Text>
            <Text style={textStyle}>
              • Your account has been completely removed from our system<br />
              • All your personal data has been deleted<br />
              • You will no longer be able to access our services with this account<br />
              • This action is irreversible and permanent<br />
              {userType === 'agent' && (
                <>
                  • All your property listings have been hidden from public view for legal compliance<br />
                  • Property data is retained as required by real estate regulations<br />
                </>
              )}
              • If you wish to use our platform again, you will need to create a new account
            </Text>
          </div>

          <div style={sectionStyle}>
            <Text style={labelStyle}>Legal Note:</Text>
            <Text style={textStyle}>
              {userType === 'agent' 
                ? 'In accordance with real estate regulations, your property listings have been hidden but relevant data is maintained in our records for compliance purposes.'
                : 'Your personal information has been permanently removed from our active systems.'
              }
            </Text>
          </div>

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

// Reuse the same styles from your previous email templates
const bodyStyle = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif, Helvetica',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  padding: '20px',
  maxWidth: '600px',
  margin: '20px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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

const footerStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0'
};