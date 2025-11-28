import * as React from 'react';
import { Html, Head, Body, Text, Container, Section } from '@react-email/components';

interface EmailTemplateProps {
  name: string;
  title: string;
  message: string;
  isInspection: boolean;
}

export function InspectionEmailTemplate(props: EmailTemplateProps) {
  const { title, name, message, isInspection } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              {isInspection ? 'Property Inspection' : 'Schedule Update'}
            </Text>
            <Text style={headerSubtitleStyle}>
              {title}
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hello {name},
            </Text>
            <Text style={textStyle}>
              {message}
            </Text>
          </Section>

          {/* Additional Information Section */}
          <Section style={infoSectionStyle}>
            <Text style={labelStyle}>
              {isInspection ? 'About Your Property Inspection' : 'Important Information'}
            </Text>
            <Text style={textStyle}>
              {isInspection 
                ? 'This notification contains important details about your upcoming property inspection. Please review the information carefully and contact us if you have any questions or need to make changes to your schedule.'
                : 'This notification contains important updates regarding your real estate activities. Please review the information carefully and take any necessary actions.'
              }
            </Text>
          </Section>

          {/* Next Steps Section */}
          <Section style={stepsSectionStyle}>
            <Text style={labelStyle}>Next Steps:</Text>
            <Text style={textStyle}>
              {isInspection
                ? '• Review the inspection details provided above\n• Prepare any necessary documents or access\n• Contact your agent if you have questions\n• Confirm your availability for the scheduled time'
                : '• Review the information provided above\n• Contact your real estate agent if needed\n• Update your calendar with any relevant dates\n• Reach out for clarification if anything is unclear'
              }
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSectionStyle}>
            <Text style={labelStyle}>Need Assistance?</Text>
            <Text style={textStyle}>
              If you have any questions or need to make changes, please don't hesitate to contact your Nomeo Realtors agent or our support team.
            </Text>
          </Section>

          {/* Footer Note */}
          <Section style={footerNoteStyle}>
            <Text style={footerTextStyle}>
              {isInspection 
                ? 'If this inspection schedule was not meant for you, please disregard this message.'
                : 'If this information is not meant for you, please disregard this message.'
              }
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerTextStyle}>
              The Nomeo Realtors Team
            </Text>
            <Text style={footerNoteStyle}>
              Connecting you with your perfect property
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
  backgroundColor: '#023e8a',
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
  fontSize: '18px',
  color: '#e3f2fd',
  margin: '0',
  lineHeight: '1.4',
  fontWeight: 'normal'
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
  margin: '10px 0',
  whiteSpace: 'pre-line' as const
};

const infoSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f7ff',
  borderRadius: '6px',
  border: '1px solid #d0e3ff',
  borderLeft: '4px solid #023e8a'
};

const stepsSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const contactSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9'
};

const footerNoteStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  textAlign: 'center' as const
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
};

const footerStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#666666',
  margin: '5px 0'
};