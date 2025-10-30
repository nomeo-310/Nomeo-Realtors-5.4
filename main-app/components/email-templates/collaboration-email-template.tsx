import * as React from 'react';
import { Html, Head, Body, Text, Container } from '@react-email/components';

interface EmailTemplateProps {
  recipient: string;
  author: string;
  blog_title: string;
};

export function CollaborationEmailTemplate (props:EmailTemplateProps) {
  const { recipient, author, blog_title } = props;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', maxWidth: '600px', margin: '20px auto' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', padding: '20px', backgroundColor: '#4caf50', borderRadius: '10px 10px 0 0', color: '#ffffff',  }}>
            You&apos;ve been invited to collaborate on a new blog post!
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            Hi {recipient},
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            You&apos;ve been invited by {author} to collaborate on a new blog post titled:
          </Text>
          <Text style={{ fontSize: '24px', marginBottom: '20px', marginTop: '20px', textAlign: 'center', lineHeight: '36px', color: '#333' }}>
            {blog_title}
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '10px' }}>
            To view the project details and accept the invitation, please log in to your account and navigate to the notifications to accept the invitation and check your blog draft to contibute your part.
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