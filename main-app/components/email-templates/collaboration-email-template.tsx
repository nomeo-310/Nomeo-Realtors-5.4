import * as React from 'react';
import { Html, Head, Body, Text, Container, Section, Button } from '@react-email/components';

interface EmailTemplateProps {
  recipient: string;
  author: string;
  blog_title: string;
}

export function CollaborationEmailTemplate(props: EmailTemplateProps) {
  const { recipient, author, blog_title } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Collaboration Invitation
            </Text>
            <Text style={headerSubtitleStyle}>
              You&apos;ve been invited to collaborate on a new blog post!
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hi {recipient},
            </Text>
            <Text style={textStyle}>
              You&apos;ve been invited by <strong>{author}</strong> to collaborate on a new blog post titled:
            </Text>
          </Section>

          {/* Blog Post Highlight */}
          <Section style={highlightSectionStyle}>
            <Text style={highlightLabelStyle}>Blog Post Title:</Text>
            <Text style={highlightTitleStyle}>
              &quot;{blog_title}&quot;
            </Text>
          </Section>

          {/* Collaboration Details */}
          <Section style={detailsSectionStyle}>
            <Text style={labelStyle}>What&apos;s Next:</Text>
            <Text style={textStyle}>
              To view the project details and accept the invitation:
              <br /><br />
              1. Log in to your Nomeo Realtors account<br />
              2. Navigate to your notifications section<br />
              3. Accept the collaboration invitation<br />
              4. Access the blog draft from your dashboard<br />
              5. Contribute your part to the blog post
            </Text>
          </Section>

          {/* Community Section */}
          <Section style={communitySectionStyle}>
            <Text style={communityTitleStyle}>Join Our Writing Community</Text>
            <Text style={textStyle}>
              Thank you for being a part of our writing community. Your contributions help build valuable 
              content for the real estate industry and share knowledge with professionals worldwide.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerTextStyle}>
              The Nomeo Realtors Blog Team
            </Text>
            <Text style={footerNoteStyle}>
              Building the future of real estate knowledge, one post at a time.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles - Consistent with your other templates
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
  backgroundColor: '#4caf50',
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
  color: '#e8f5e9',
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

const highlightSectionStyle = {
  margin: '25px 0',
  padding: '20px',
  backgroundColor: '#f0f7ff',
  borderRadius: '6px',
  border: '1px solid #d0e3ff',
  borderLeft: '4px solid #1976d2'
};

const highlightLabelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1976d2',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
};

const highlightTitleStyle = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#1565c0',
  margin: '0',
  lineHeight: '1.4',
  fontStyle: 'italic'
};

const detailsSectionStyle = {
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
  marginBottom: '12px'
};

const ctaSectionStyle = {
  margin: '25px 0',
  padding: '20px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  textAlign: 'center' as const
};

const ctaTextStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#e65100',
  margin: '0 0 15px 0'
};

const buttonStyle = {
  backgroundColor: '#4caf50',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block'
};

const communitySectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f3e5f5',
  borderRadius: '6px',
  border: '1px solid #e1bee7',
  borderLeft: '4px solid #7b1fa2'
};

const communityTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#7b1fa2',
  marginBottom: '10px'
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