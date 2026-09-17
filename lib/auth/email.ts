import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OTP_EXPIRY_MIN = parseInt(process.env.OTP_EXPIRY_MIN || '10', 10);

async function getGmailClient() {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      return null;
    }

    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.error('Failed to get Gmail client:', error);
    return null;
  }
}

export async function sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4568F0;">DigiSahayak - Password Reset</h2>
      <p>You requested to reset your password. Use the following verification code:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h1 style="color: #333; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666;">This code will expire in ${OTP_EXPIRY_MIN} minutes.</p>
      <p style="color: #666;">If you didn't request this code, please ignore this email and your account will remain secure.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">DigiSahayak - Your Digital Government Services Assistant</p>
    </div>
  `;

  const emailText = `Your DigiSahayak password reset code is: ${otp}. This code expires in ${OTP_EXPIRY_MIN} minutes.`;

  // Try Gmail API first
  try {
    const gmail = await getGmailClient();
    if (gmail) {
      const message = Buffer.from(
        `To: ${email}\r\n` +
        `Subject: DigiSahayak - Password Reset Code\r\n` +
        `Content-Type: text/html; charset="UTF-8"\r\n\r\n` +
        emailHtml
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Password reset OTP sent to ${email} via Gmail`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send via Gmail API:', error);
  }

  // Fallback to SMTP
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM || 'DigiSahayak <noreply@digisahayak.example>';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('='.repeat(50));
    console.log('📧 DEV MODE: Password Reset OTP');
    console.log(`   Email: ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log('='.repeat(50));
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'DigiSahayak - Password Reset Code',
      html: emailHtml,
      text: emailText,
    });

    console.log(`✅ Password reset OTP sent to ${email} via SMTP`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
}
