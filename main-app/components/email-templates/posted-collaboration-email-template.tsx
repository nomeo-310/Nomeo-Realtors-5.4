import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface EmailTemplateProps {
  recipient: string;
  author: string;
}

export function PostedCollaborationEmailTemplate(props: EmailTemplateProps) {
  const { recipient, author } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Collaboration Published!
            </Text>
            <Text style={headerSubtitleStyle}>
              Your collaborative blog post is now live
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hi {recipient},
            </Text>
            <Text style={textStyle}>
              Great news! Your collaborative blog post with <strong>{author}</strong> has been successfully published and is now live on our platform.
            </Text>
          </Section>

          {/* Success Highlight */}
          <Section style={successSectionStyle}>
            <Text style={successTitleStyle}>
              Publication Successful
            </Text>
            <Text style={textStyle}>
              Your hard work and contributions have paid off. The blog post is now available for our community to read and benefit from your insights.
            </Text>
          </Section>

          {/* View Your Work */}
          <Section style={sectionStyle}>
            <Text style={labelStyle}>View Your Published Work:</Text>
            <Text style={textStyle}>
              To see your published collaboration:
              <br /><br />
              1. Log in to your Nomeo Realtors account<br />
              2. Navigate to the blogs section<br />
              3. Find your published post in the listings<br />
              4. Share it with your network to increase reach
            </Text>
          </Section>

          {/* Impact Section */}
          <Section style={impactSectionStyle}>
            <Text style={labelStyle}>Your Impact:</Text>
            <Text style={textStyle}>
              By contributing to this collaborative piece, you&apos;re helping to:
              <br /><br />
              • Share valuable knowledge with the real estate community<br />
              • Establish yourself as a thought leader in the industry<br />
              • Build connections with other professionals<br />
              • Enhance the quality of content available to all members
            </Text>
          </Section>

          {/* Community Appreciation */}
          <Section style={communitySectionStyle}>
            <Text style={communityTitleStyle}>Thank You for Your Contribution</Text>
            <Text style={textStyle}>
              Your participation in our writing community helps build valuable content for the real estate industry. 
              We appreciate your dedication to sharing knowledge and expertise with fellow professionals.
            </Text>
          </Section>

          {/* Future Collaborations */}
          <Section style={futureSectionStyle}>
            <Text style={labelStyle}>Looking Ahead:</Text>
            <Text style={textStyle}>
              Interested in future collaborations? Keep an eye on your notifications for new opportunities 
              to work with other talented writers and professionals in our community.
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
              Building knowledge, one collaboration at a time
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

const successSectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9',
  borderLeft: '4px solid #4caf50'
};

const successTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2e7d32',
  margin: '0 0 10px 0'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
};

const impactSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f7ff',
  borderRadius: '6px',
  border: '1px solid #d0e3ff'
};

const communitySectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80'
};

const communityTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#e65100',
  marginBottom: '10px'
};

const futureSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f3e5f5',
  borderRadius: '6px',
  border: '1px solid #e1bee7'
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