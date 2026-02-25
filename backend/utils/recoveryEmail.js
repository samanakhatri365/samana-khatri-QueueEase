import sgMail from "@sendgrid/mail";
import catchAsync from "./catchAsync.js";
import dotenv from "dotenv";
dotenv.config();

export default catchAsync(async (options) => {
  sgMail.setApiKey(process.env.SEND_GRID_KEY);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: "Account Recovery OTP",
    text: `Your OTP for account recovery is: ${options.resetOtp}`,
    html: `
      <p>Your OTP for account recovery is:</p>
      <h2>${options.resetOtp}</h2>
    `,
  };
  // Send mail with OTP
  await sgMail.send(message);

  return options.resetOtp;
});
