import * as React from 'react';
import { Html, Head, Body, Text, Container, Section, Link } from '@react-email/components';

interface RoleAssignmentEmailTemplateProps {
  name: string;
  previousRole: string;
  newRole: string;
  changedBy: string;
  contactEmail?: string;
  isNewAdmin?: boolean;
  accessId?: string;
  expiresAt?: number;
}

export function RoleAssignmentEmailTemplate(props: RoleAssignmentEmailTemplateProps) {
  const { 
    name, 
    previousRole, 
    newRole, 
    changedBy, 
    contactEmail = 'support@nomeorealtors.com',
    isNewAdmin = false,
    accessId,
    expiresAt
  } = props;

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'user': 'Regular User',
      'agent': 'Real Estate Agent',
      'admin': 'Administrator',
      'superAdmin': 'Super Administrator',
      'creator': 'Content Creator'
    };
    return roleMap[role] || role;
  };

  const isPromotion = () => {
    const roleHierarchy = ['user', 'agent', 'creator', 'admin', 'superAdmin'];
    return roleHierarchy.indexOf(newRole) > roleHierarchy.indexOf(previousRole);
  };

  const isAdminRole = (role: string) => {
    return ['admin', 'superAdmin', 'creator'].includes(role);
  };

  const isNewAdminSetup = isNewAdmin && accessId && expiresAt;
  const formattedExpiry = expiresAt ? new Date(expiresAt).toLocaleString() : '';

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>
              {isNewAdminSetup ? 'Welcome to Admin Team!' : 
               isPromotion() ? 'Role Upgraded!' : 'Role Updated'}
            </Text>
            <Text style={headerSubtitleStyle}>
              {isNewAdminSetup 
                ? 'Complete your administrator account setup'
                : `Your account role has been ${isPromotion() ? 'upgraded' : 'updated'}`
              }
            </Text>
          </Section>

          {/* Greeting Section */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              Dear {name},
            </Text>
            <Text style={textStyle}>
              {isNewAdminSetup 
                ? `You have been added as a ${getRoleDisplayName(newRole)} by ${changedBy}. Welcome to the Nomeo Realtors administrative team!`
                : `Your account role with Nomeo Realtors has been ${isPromotion() ? 'upgraded' : 'updated'}. This change affects your access levels and platform permissions.`
              }
            </Text>
          </Section>

          {/* Access ID Section for New Admins */}
          {isNewAdminSetup && (
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
              <Text style={textStyle}>
                <strong>Setup Link:</strong>{' '}
                <Link href={`${process.env.APP_URL}/admin/set-up`} style={linkStyle}>
                  {process.env.APP_URL}/admin/setup
                </Link>
              </Text>
            </Section>
          )}

          {/* Role Change Details */}
          <Section style={detailsSectionStyle}>
            <Text style={labelStyle}>Role Change Details:</Text>
            <Section style={changeDetailsStyle}>
              <Text style={detailItemStyle}>
                <strong>Previous Role:</strong> {getRoleDisplayName(previousRole)}
              </Text>
              <Text style={detailItemStyle}>
                <strong>New Role:</strong> {getRoleDisplayName(newRole)}
              </Text>
              <Text style={detailItemStyle}>
                <strong>Changed By:</strong> {changedBy}
              </Text>
              <Text style={detailItemStyle}>
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </Text>
            </Section>
          </Section>

          {/* Setup Instructions for New Admins */}
          {isNewAdminSetup && (
            <Section style={instructionsSectionStyle}>
              <Text style={labelStyle}>Setup Instructions:</Text>
              <Text style={textStyle}>
                1. Visit the admin setup page using the link above<br />
                2. Enter your Access ID when prompted<br />
                3. Create a secure password for your admin account<br />
                4. Complete your profile setup<br />
                5. Start using your new administrative privileges
              </Text>
            </Section>
          )}

          {/* What This Means Section */}
          <Section style={impactSectionStyle}>
            <Text style={labelStyle}>
              {isNewAdminSetup ? 'What To Expect:' : 'What This Means For You:'}
            </Text>
            <Text style={textStyle}>
              {isNewAdminSetup ? (
                <>
                  • You'll need to complete the setup process first<br />
                  • After setup, you'll have access to admin dashboard<br />
                  • New administrative tools and features will be available<br />
                  • You'll receive additional training resources<br />
                </>
              ) : isPromotion() ? (
                <>
                  • You now have access to additional features and tools<br />
                  • Your platform permissions have been expanded<br />
                  • You may see new options in your dashboard<br />
                  • Additional responsibilities may come with this role<br />
                </>
              ) : (
                <>
                  • Your platform access and permissions have been updated<br />
                  • Some features may now be available or restricted<br />
                  • Your dashboard interface may show different options<br />
                </>
              )}
              • Please log out and log back in to see all changes
            </Text>
          </Section>

          {/* New Role Specific Information */}
          {newRole === 'agent' && (
            <Section style={infoSectionStyle}>
              <Text style={labelStyle}>Welcome to Agent Role!</Text>
              <Text style={textStyle}>
                As a Real Estate Agent, you can now create property listings, manage client inquiries, 
                and access our agent-exclusive tools and resources.
              </Text>
            </Section>
          )}

          {(newRole === 'admin' || newRole === 'superAdmin' || newRole === 'creator') && (
            <Section style={adminSectionStyle}>
              <Text style={labelStyle}>
                {newRole === 'superAdmin' ? 'Super Administrator Privileges' :
                 newRole === 'creator' ? 'Content Creator Role' : 'Administrator Access'}
              </Text>
              <Text style={textStyle}>
                {newRole === 'superAdmin' 
                  ? 'You have been granted Super Administrator access - the highest privilege level with full system access and ability to manage all users and admins.'
                  : newRole === 'creator'
                  ? 'You can now create and publish blog content, collaborate with other creators, and help build our real estate knowledge base.'
                  : 'You now have administrative privileges including user management, content moderation, and system configuration capabilities.'
                }
              </Text>
            </Section>
          )}

          {/* Special Note for Admin Role Changes */}
          {isAdminRole(newRole) && (
            <Section style={importantNoteSectionStyle}>
              <Text style={importantNoteTitleStyle}>
                {isNewAdminSetup ? '🔒 Important Security Setup' : '🔒 Important Security Note'}
              </Text>
              <Text style={textStyle}>
                <strong>With great power comes great responsibility.</strong>{' '}
                {isNewAdminSetup 
                  ? 'During setup, please create a strong password and follow our security guidelines.'
                  : 'As an administrator, you have access to sensitive system functions and user data.'
                }
              </Text>
              <Text style={textStyle}>
                {isNewAdminSetup ? (
                  <>
                    • Keep your Access ID confidential until setup<br />
                    • Create a strong, unique password during setup<br />
                    • Enable two-factor authentication if available<br />
                    • Follow our admin security guidelines<br />
                  </>
                ) : (
                  <>
                    • Keep your login credentials secure<br />
                    • Follow our admin security guidelines<br />
                    • Use your privileges ethically and responsibly<br />
                    • Report any suspicious activities immediately<br />
                  </>
                )}
              </Text>
            </Section>
          )}

          {/* Urgent Notice for New Admins */}
          {isNewAdminSetup && (
            <Section style={urgentSectionStyle}>
              <Text style={urgentTitleStyle}>⏰ Urgent Action Required</Text>
              <Text style={textStyle}>
                <strong>Your Access ID expires in 24 hours.</strong> If you don't complete the setup 
                before {formattedExpiry}, the Access ID will become invalid and you'll need to 
                contact the administrator for a new one.
              </Text>
            </Section>
          )}

          {/* Support Section */}
          <Section style={supportSectionStyle}>
            <Text style={labelStyle}>Need Help?</Text>
            <Text style={textStyle}>
              {isNewAdminSetup
                ? 'If you encounter any issues during setup or have questions about your new role, our support team is ready to help you get started.'
                : isAdminRole(newRole)
                ? 'If you have questions about your new administrative role, need training on admin tools, or encounter any issues, our support team is here to assist you.'
                : 'If you have questions about your new role, need training, or encounter any issues, our support team is here to help you get acquainted with your updated permissions.'
              }
            </Text>
            <Text style={textStyle}>
              Contact us at: <Link href={`mailto:${contactEmail}`} style={linkStyle}>
                {contactEmail}
              </Link>
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
              {isAdminRole(newRole) 
                ? 'Building a secure and powerful platform together'
                : 'Empowering our community with the right tools'
              }
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (same as before with additions for accessId)
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

// New styles for accessId section
const accessIdSectionStyle = {
  margin: '25px 0',
  padding: '0',
  textAlign: 'center' as const
};

const accessIdDisplayStyle = {
  margin: '15px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '2px dashed #1976d2'
};

const accessIdTextStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  color: '#1976d2',
  margin: '0',
  fontFamily: 'monospace, Courier New'
};

const expiryTextStyle = {
  fontSize: '14px',
  color: '#666666',
  margin: '10px 0 0 0',
  fontStyle: 'italic'
};

const instructionsSectionStyle = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#e3f2fd',
  borderRadius: '8px',
  border: '1px solid #bbdefb'
};

const detailsSectionStyle = {
  margin: '20px 0',
  padding: '0'
};

const changeDetailsStyle = {
  margin: '15px 0',
  padding: '20px',
  backgroundColor: '#f0f7ff',
  borderRadius: '6px',
  border: '1px solid #d0e3ff',
  borderLeft: '4px solid #1976d2'
};

const impactSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const infoSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9'
};

const adminSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e3f2fd',
  borderRadius: '6px',
  border: '1px solid #bbdefb',
  borderLeft: '4px solid #1976d2'
};

const importantNoteSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff3e0',
  borderRadius: '6px',
  border: '1px solid #ffcc80',
  borderLeft: '4px solid #ff9800'
};

const urgentSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#ffebee',
  borderRadius: '6px',
  border: '1px solid #ffcdd2',
  borderLeft: '4px solid #f44336'
};

const supportSectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#e8f5e8',
  borderRadius: '6px',
  border: '1px solid #c8e6c9'
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '12px'
};

const importantNoteTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#e65100',
  marginBottom: '12px'
};

const urgentTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#c62828',
  marginBottom: '12px'
};

const detailItemStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '8px 0'
};

const linkStyle = {
  color: '#1976d2',
  textDecoration: 'underline'
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