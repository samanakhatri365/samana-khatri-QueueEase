import dotenv from "dotenv";
dotenv.config();

/**
 * Validates if email domain is authorized for staff accounts
 * @param {string} email - Email to validate
 * @returns {boolean} - True if authorized, false otherwise
 */
const validateStaffEmail = (email) => {
  try {
    // Get allowed domains from environment variable
    const allowedDomains = process.env.ALLOWED_STAFF_EMAIL_DOMAINS 
      ? process.env.ALLOWED_STAFF_EMAIL_DOMAINS.split(',').map(d => d.trim().toLowerCase())
      : ['hospital.com', 'healthcare.com', 'clinic.com']; // Default domains

    // Extract domain from email
    const emailDomain = email.toLowerCase().split('@')[1];

    if (!emailDomain) {
      return false;
    }

    // Check if domain is in allowed list
    return allowedDomains.includes(emailDomain);
  } catch (error) {
    console.error("Email validation error:", error);
    return false;
  }
};

/**
 * Get list of allowed domains for error messages
 * @returns {string} - Comma-separated list of allowed domains
 */
export const getAllowedDomains = () => {
  const allowedDomains = process.env.ALLOWED_STAFF_EMAIL_DOMAINS 
    ? process.env.ALLOWED_STAFF_EMAIL_DOMAINS.split(',').map(d => d.trim())
    : ['hospital.com', 'healthcare.com', 'clinic.com'];
  
  return allowedDomains.join(', ');
};

export default validateStaffEmail;
