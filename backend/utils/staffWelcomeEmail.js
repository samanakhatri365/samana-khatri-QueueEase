import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

/**
 * Send welcome email to newly created staff member
 * @param {Object} options - Email options
 * @param {string} options.email - Staff member's email
 * @param {string} options.name - Staff member's name
 * @param {string} options.password - Temporary password (plain text)
 * @param {string} options.departmentName - Department name
 * @param {string} options.role - Staff role (e.g., "Doctor", "Nurse")
 */
const sendStaffWelcomeEmail = async (options) => {
  try {
    sgMail.setApiKey(process.env.SEND_GRID_KEY);

    const loginUrl = process.env.CLIENT_URL?.split(',')[0] + '/login' || 'http://localhost:5173/login';

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: `Welcome to QueueEase - Your Staff Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏥 Welcome to QueueEase!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Your Staff Account is Ready</p>
          </div>

          <!-- Body -->
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #64748b; margin: 0 0 20px 0;">Hello <strong style="color: #1e293b;">${options.name}</strong>,</p>
            
            <p style="color: #64748b; margin: 0 0 24px 0;">
              Your staff account has been successfully created by the administrator. You can now access the QueueEase staff portal to manage patient queues.
            </p>

            <!-- Credentials Card -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 16px;">🔐 Your Login Credentials</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${options.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Password:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px; font-family: monospace;">${options.password}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Department:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${options.departmentName || 'Not Assigned'}</td>
                </tr>
              </table>
            </div>

            <!-- Login Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Login to Staff Portal →
              </a>
            </div>

            <!-- Security Notice -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 24px; border-radius: 0 8px 8px 0;">
              <p style="color: #92400e; margin: 0; font-size: 13px;">
                <strong>🔒 Security Notice:</strong> Please change your password after your first login. Keep your credentials confidential and never share them with anyone.
              </p>
            </div>

            <!-- Support -->
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">
                If you did not expect this email or have any questions, please contact your administrator immediately.
              </p>
            </div>

            <!-- Footer -->
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
              QueueEase Healthcare Management System<br/>
              <a href="${loginUrl}" style="color: #0ea5e9; text-decoration: none;">Login Portal</a>
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(message);
    console.log(`Staff welcome email sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send staff welcome email:", error);
    // Don't throw - email failure shouldn't block account creation
    return false;
  }
};

export default sendStaffWelcomeEmail;
