import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
  message: string;
  email:string;
  phoneNumber?: string;
};

export function ContactEmailTemplate (props:EmailTemplateProps) {
  const { name, message, email, phoneNumber} = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ padding: '20px', maxWidth: '700px', margin: '10px auto' }}>
          <Text style={{ fontSize: '16px'}}>
            Name: {name}, 
          </Text>
          <Text style={{ fontSize: '16px'}}>
            Email address: {email},
          </Text>
          { phoneNumber &&
            <Text style={{ fontSize: '16px'}}>
              Phone Number: {phoneNumber},
            </Text>
          }
          <Text style={{ fontSize: '16px'}}>
            Message: {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};