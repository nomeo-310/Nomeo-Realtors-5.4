import * as React from 'react';
import { Html, Head, Body, Text, Container, Section, Button, Link } from '@react-email/components';

interface AdminSetupEmailTemplateProps {
  name: string;
  role: string;
  accessId: string;
  expiresAt: number;
  assignedBy: string;
  contactEmail?: string;
}

export function AdminSetupEmailTemplate(props: AdminSetupEmailTemplateProps) {
  const { 
    name, 
    role, 
    accessId, 
    expiresAt, 
    assignedBy, 
    contactEmail = 'support@nomeorealtors.com' 
  } = props;

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'superAdmin': 'Super Administrator',
      'creator': 'Content Creator'
    };
    return roleMap[role] || role;
  };

  const setupLink = `${process.env.APP_URL || 'https://yourdomain.com'}/admin/setup`;
  const expiryDate = new Date(expiresAt);
  const formattedExpiry = expiryDate.toLocaleString();

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              Welcome to Nomeo Realtors Admin Team!
            </Text>
            <Text style={headerSubtitleStyle}>
              You've been invited to join as {getRoleDisplayName(role)}
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Hello {name},
            </Text>
            <Text style={textStyle}>
              <strong>{assignedBy}</strong> has invited you to become a{' '}
              <strong>{getRoleDisplayName(role)}</strong> at Nomeo Realtors. 
              Welcome to our administrative team!
            </Text>
          </Section>

          {/* Access ID Section */}
          <Section style={accessIdSectionStyle}>
            <Text style={labelStyle}>Your Access ID:</Text>
            <Section style={accessIdDisplayStyle}>
              <Text style={accessIdTextStyle}>
                {accessId}
              </Text>
            </Section>
            <Text style={expiryTextStyle}>
              <strong>Expires:</strong> {formattedExpiry}
            </Text>
          </Section>

          {/* Setup Instructions */}
          <Section style={instructionsSectionStyle}>
            <Text style={labelStyle}>Get Started in 3 Simple Steps:</Text>
            <Text style={textStyle}>
              1. <strong>Click the setup button below</strong><br />
              2. <strong>Enter your Access ID</strong> on the setup page<br />
              3. <strong>Create your password</strong> and complete your profile
            </Text>
          </Section>

          {/* Setup Button */}
          <Section style={buttonSectionStyle}>
            <Button 
              href={setupLink}
              style={buttonStyle}
            >
              Start Admin Setup
            </Button>
          </Section>

          {/* Role Benefits */}
          <Section style={benefitsSectionStyle}>
            <Text style={labelStyle}>As {getRoleDisplayName(role)}, You'll Be Able To:</Text>
            {role === 'admin' && (
              <Text style={textStyle}>
                • Manage users and their permissions<br />
                • Moderate content and listings<br />
                • Access administrative reports<br />
                • Configure system settings<br />
                • Support our community members
              </Text>
            )}
            {role === 'superAdmin' && (
              <Text style={textStyle}>
                • Oversee all platform operations<br />
                • Manage administrative team<br />
                • Set security policies<br />
                • Access advanced analytics<br />
                • Make strategic platform decisions
              </Text>
            )}
            {role === 'creator' && (
              <Text style={textStyle}>
                • Create engaging blog content<br />
                • Publish real estate insights<br />
                • Collaborate with other creators<br />
                • Manage content categories<br />
                • Build our knowledge base
              </Text>
            )}
          </Section>

          {/* Security Notice */}
          <Section style={securitySectionStyle}>
            <Text style={securityTitleStyle}>Your Security is Important</Text>
            <Text style={textStyle}>
              Please follow these security practices during setup:
            </Text>
            <Text style={textStyle}>
              • <strong>Keep your Access ID private</strong> - don't share it<br />
              • <strong>Create a strong password</strong> with letters, numbers, and symbols<br />
              • <strong>Complete setup promptly</strong> - your Access ID expires in 24 hours<br />
              • <strong>Contact support</strong> if you notice anything suspicious
            </Text>
          </Section>

          {/* Urgent Notice */}
          <Section style={urgentSectionStyle}>
            <Text style={urgentTitleStyle}>Action Required Within 24 Hours</Text>
            <Text style={textStyle}>
              <strong>Your Access ID will expire on {formattedExpiry}.</strong>{' '}
              If you don't complete the setup before then, you'll need to request 
              a new Access ID from your administrator.
            </Text>
          </Section>

          {/* Support Section */}
          <Section style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help With Setup?</Text>
            <Text style={textStyle}>
              Our support team is here to help you get started smoothly. 
              If you have any questions or run into issues:
            </Text>
            <Text style={textStyle}>
                Email: <Link href={`mailto:${contactEmail}`} style={linkStyle}>
                {contactEmail}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              We're excited to have you on board!
            </Text>
            <Text style={footerTextStyle}>
              Best regards,
            </Text>
            <Text style={footerSignatureStyle}>
              The Nomeo Realtors Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles for Admin Setup Email
const bodyStyle = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Arial, sans-serif, Helvetica',
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: 'antialiased',
  MsTextSizeAdjust: '100%'
};

const containerStyle = {
  padding: '0',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const headerSectionStyle = {
  padding: '40px 30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textAlign: 'center' as const
};

const headerTitleStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 10px 0',
  lineHeight: '1.3'
};

const headerSubtitleStyle = {
  fontSize: '18px',
  color: '#f0f0f0',
  margin: '0',
  lineHeight: '1.4'
};

const sectionStyle = {
  padding: '30px'
};

const greetingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 20px 0'
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0 0 16px 0'
};

const accessIdSectionStyle = {
  padding: '30px',
  backgroundColor: '#f7fafc',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0'
};

const accessIdDisplayStyle = {
  margin: '20px 0',
  padding: '30px 20px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '3px dashed #667eea',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const accessIdTextStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  color: '#2d3748',
  margin: '0',
  fontFamily: 'monospace, Courier New',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const expiryTextStyle = {
  fontSize: '14px',
  color: '#718096',
  margin: '10px 0 0 0',
  fontStyle: 'italic'
};

const instructionsSectionStyle = {
  padding: '30px',
  backgroundColor: '#edf2f7'
};

const buttonSectionStyle = {
  padding: '0 30px 30px',
  textAlign: 'center' as const
};

const buttonStyle = {
  backgroundColor: '#48bb78',
  color: '#ffffff',
  padding: '18px 36px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-block',
  boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)'
};

const benefitsSectionStyle = {
  padding: '30px',
  backgroundColor: '#f0fff4',
  borderLeft: '4px solid #48bb78'
};

const securitySectionStyle = {
  padding: '30px',
  backgroundColor: '#fffaf0',
  borderLeft: '4px solid #ed8936'
};

const securityTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#dd6b20',
  margin: '0 0 16px 0'
};

const urgentSectionStyle = {
  padding: '30px',
  backgroundColor: '#fed7d7',
  borderLeft: '4px solid #f56565'
};

const urgentTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#c53030',
  margin: '0 0 16px 0'
};

const supportSectionStyle = {
  padding: '30px',
  backgroundColor: '#ebf8ff',
  borderLeft: '4px solid #4299e1'
};

const labelStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2d3748',
  margin: '0 0 16px 0'
};

const linkStyle = {
  color: '#4299e1',
  textDecoration: 'underline',
  fontWeight: 'bold'
};

const footerStyle = {
  padding: '30px',
  backgroundColor: '#2d3748',
  textAlign: 'center' as const
};

const footerTextStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#e2e8f0',
  margin: '0 0 10px 0'
};

const footerSignatureStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '20px 0 0 0'
};

export default AdminSetupEmailTemplate;