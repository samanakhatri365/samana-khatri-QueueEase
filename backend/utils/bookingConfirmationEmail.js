import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

/**
 * Send booking confirmation email to patient
 * @param {Object} options - Email options
 * @param {string} options.email - Patient's email
 * @param {string} options.name - Patient's name
 * @param {string} options.tokenNumber - Token number (e.g., "GP001")
 * @param {string} options.departmentName - Department name
 * @param {string} options.doctorName - Doctor's name
 * @param {string} options.date - Booking date
 */
const sendBookingConfirmation = async (options) => {
  try {
    sgMail.setApiKey(process.env.SEND_GRID_KEY);

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: `Booking Confirmed - Token #${options.tokenNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎫 Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">QueueEase Digital Token</p>
          </div>

          <!-- Ticket Body -->
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #64748b; margin: 0 0 20px 0;">Hello <strong style="color: #1e293b;">${options.name}</strong>,</p>
            
            <p style="color: #64748b; margin: 0 0 24px 0;">
              Your queue token has been successfully booked. Please keep this information handy.
            </p>

            <!-- Token Number Card -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your Token Number</p>
              <h2 style="color: #1e293b; font-size: 48px; font-weight: 800; margin: 0; letter-spacing: 2px;">
                #${options.tokenNumber}
              </h2>
            </div>

            <!-- Details Grid -->
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Department</span>
                  <p style="color: #1e293b; font-weight: 600; margin: 4px 0 0 0;">${options.departmentName}</p>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                  <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Date</span>
                  <p style="color: #1e293b; font-weight: 600; margin: 4px 0 0 0;">${options.date}</p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px 0;">
                  <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Consulting Doctor</span>
                  <p style="color: #1e293b; font-weight: 600; margin: 4px 0 0 0;">Dr. ${options.doctorName}</p>
                </td>
              </tr>
            </table>

            <!-- Instructions -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 24px; border-radius: 0 8px 8px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⏰ Important:</strong> Please arrive 10 minutes before your estimated turn. 
                You can track your live queue position in the QueueEase app.
              </p>
            </div>

            <!-- Footer -->
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
              Thank you for using QueueEase!<br/>
              <a href="#" style="color: #10b981; text-decoration: none;">Track Your Queue →</a>
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(message);
    console.log(`Booking confirmation email sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    // Don't throw - email failure shouldn't block token creation
    return false;
  }
};

export default sendBookingConfirmation;
