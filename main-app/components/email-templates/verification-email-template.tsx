import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  username: string;
  title: string;
  otp: string;
  message: string;
};

export function VerificationEmailTemplate (props:EmailTemplateProps) {
  const { title, username, message, otp } = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', maxWidth: '600px', margin: '20px auto' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', padding: '20px', backgroundColor: '#4caf50', borderRadius: '10px 10px 0 0', color: '#ffffff',  }}>
            {title}
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Hello {username}, welcome to Nomeo Realtors.
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            {message}
          </Text>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', margin: '30px 0', textAlign: 'center', lineHeight: '36px', color: '#333' }}>
            {otp}
          </Text>
          <Text style={{ fontSize: '14px', color: '#888', lineHeight: '21px', textAlign: 'center', marginBottom: '20px' }}>
            If you did not request it, please ignore this email.
          </Text>
          <Text style={{ fontSize: '14px', color: '#888', lineHeight: '21px', textAlign: 'center',  padding: '20px'}}>
            This OTP is valid for a limited time.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};