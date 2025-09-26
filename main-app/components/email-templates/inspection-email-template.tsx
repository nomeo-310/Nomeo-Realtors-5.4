import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
  title: string;
  message: string;
};

export function InspectionEmailTemplate (props:EmailTemplateProps) {
  const { title, name, message } = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', maxWidth: '700px', margin: '20px auto' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', padding: '20px', backgroundColor: '#023e8a', borderRadius: '10px 10px 0 0', color: '#ffffff',  }}>
            {title}
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Hello {name},
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            {message}
          </Text>
          <Text style={{ fontSize: '14px', color: '#888', lineHeight: '21px', textAlign: 'center', marginBottom: '20px' }}>
            If this schedule was not meant for you, go ahead and ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};