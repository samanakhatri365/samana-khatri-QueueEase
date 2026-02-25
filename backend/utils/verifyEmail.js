import sgMail from "@sendgrid/mail";
import catchAsync from "./catchAsync.js";
import dotenv from "dotenv";
dotenv.config();

export default catchAsync(async (options) => {
  sgMail.setApiKey(process.env.SEND_GRID_KEY);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2>Email Verification</h2>

    <p>Hello, ${options.name}</p>

    <p>
      Use the verification code below to confirm your email address:
    </p>

    <div style="
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      background: #f4f4f4;
      padding: 12px 20px;
      display: inline-block;
      border-radius: 6px;
      margin: 16px 0;
    ">
      ${options.code}
    </div>

    <p>
      This code will expire in <strong>10 minutes</strong>.
    </p>

    <p>
      If you did not request this, please ignore this email.
    </p>

    <p>
      Thanks,<br/>
      ${process.env.FROM_NAME}
    </p>
  </div>
`,
  };

  await sgMail.send(message);
});
