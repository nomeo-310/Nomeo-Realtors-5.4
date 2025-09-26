import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  recipient: string;
  author: string;
};

export function PostedCollaborationEmailTemplate (props:EmailTemplateProps) {
  const { recipient, author } = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', maxWidth: '600px', margin: '20px auto' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', padding: '20px', backgroundColor: '#4caf50', borderRadius: '10px 10px 0 0', color: '#ffffff',  }}>
            Your collaboration has been published!
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Hi {recipient},
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Your collaboration blog with {author} has been published. Thank you for your contributions towards the project. 
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            To view the project on a first hand base, login to your account and navigate to the blogs sections.
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Thank you for being a part of our writting community.
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Best regards,
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            The Nomeo Realtors Blog Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};