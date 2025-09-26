import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
};

export function TemporaryDeleteEmailTemplate (props:EmailTemplateProps) {
  const { name } = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ padding: '20px', maxWidth: '700px', margin: '10px auto' }}>
          <Text style={{ fontSize: '16px'}}>
            Dear {name}, 
          </Text>
          <Text style={{ fontSize: '16px'}}>
            We wanted to let you know that your Nomeo Realtors account has been temporarily deleted as per your request. 
            This means your account is currently inactive, but you still have 30 days to restore it before it is permanently deleted.
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 'bold'}}>
            How to Restore Your Account
          </Text>
          <Text style={{ fontSize: '16px'}}>
            If you change your mind, simply return to the Nomeo Realtors app or website and try to create a new account using the same email address and details you used before. 
            Your account will be restored, and you can continue using it as usual.
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 'bold'}}>
            What Happens After 30 Days?
          </Text>
          <Text style={{ fontSize: '16px'}}>
            If you do not restore your account within 30 days, it will be permanently deleted, and all associated data will be removed from our system.
          </Text>
          <Text style={{ fontSize: '16px'}}>
            If you have any questions or need help, feel free to contact our support team at support@nomeorealtors.com.
          </Text>
          <Text style={{ fontSize: '16px'}}>
            Thank you for being a part of Nomeo Realtors.
          </Text>
          <Text style={{ fontSize: '16px'}}>
            Best regards,
          </Text>
          <Text style={{ fontSize: '16px'}}>
            The Nomeo Realtors Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};