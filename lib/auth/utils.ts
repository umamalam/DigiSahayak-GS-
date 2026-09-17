import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const OTP_EXPIRY_MIN = parseInt(process.env.OTP_EXPIRY_MIN || '10', 10);
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is not set!');
  console.error('   Authentication will not work without a proper JWT secret.');
}

const otpRateLimits = new Map<string, { count: number; lastRequest: number }>();
const OTP_RATE_LIMIT_MAX = 3;
const OTP_RATE_LIMIT_WINDOW = 5 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MIN);
  return expiry;
}

export function generateToken(userData: { id: number; name: string; email: string; role?: string }): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ id: userData.id, name: userData.name, email: userData.email, role: userData.role || 'user' }, JWT_SECRET, options);
}

export function verifyToken(token: string): { id: number; name: string; email: string; role: string } | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'name' in decoded && 'email' in decoded) {
      return { 
        id: (decoded as { id: number; name: string; email: string; role: string }).id,
        name: (decoded as { id: number; name: string; email: string; role: string }).name,
        email: (decoded as { id: number; name: string; email: string; role: string }).email,
        role: (decoded as { id: number; name: string; email: string; role: string }).role || 'user'
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function checkOTPRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = otpRateLimits.get(identifier);

  if (!record) {
    otpRateLimits.set(identifier, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  if (now - record.lastRequest > OTP_RATE_LIMIT_WINDOW) {
    otpRateLimits.set(identifier, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  if (record.count >= OTP_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((OTP_RATE_LIMIT_WINDOW - (now - record.lastRequest)) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  record.lastRequest = now;
  return { allowed: true };
}

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

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4568F0;">DigiSahayak - Verify Your Account</h2>
      <p>Your verification code is:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h1 style="color: #333; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666;">This code will expire in ${OTP_EXPIRY_MIN} minutes.</p>
      <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">DigiSahayak - Your Digital Government Services Assistant</p>
    </div>
  `;

  const emailText = `Your DigiSahayak verification code is: ${otp}. This code expires in ${OTP_EXPIRY_MIN} minutes.`;

  // Try Gmail API first
  try {
    const gmail = await getGmailClient();
    if (gmail) {
      const message = Buffer.from(
        `To: ${email}\r\n` +
        `Subject: Your DigiSahayak Verification Code\r\n` +
        `Content-Type: text/html; charset="UTF-8"\r\n\r\n` +
        emailHtml
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Email OTP sent to ${email} via Gmail`);
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
    console.log('📧 DEV MODE: Email OTP (Gmail & SMTP not configured)');
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
      subject: 'Your DigiSahayak Verification Code',
      html: emailHtml,
      text: emailText,
    });

    console.log(`✅ Email OTP sent to ${email} via SMTP`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email OTP:', error);
    return false;
  }
}

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioPhone) {
    console.log('='.repeat(50));
    console.log('📱 DEV MODE: SMS OTP (Twilio not configured)');
    console.log(`   Phone: ${phone}`);
    console.log(`   OTP: ${otp}`);
    console.log('='.repeat(50));
    return true;
  }

  try {
    const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          Body: `Your DigiSahayak verification code is: ${otp}. Valid for ${OTP_EXPIRY_MIN} minutes.`,
          From: twilioPhone,
          To: phone,
        }),
      }
    );

    if (response.ok) {
      console.log(`✅ SMS OTP sent to ${phone}`);
      return true;
    } else {
      throw new Error(`Twilio API error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to send SMS OTP:', error);
    console.log('='.repeat(50));
    console.log('📱 FALLBACK: SMS OTP (Twilio error)');
    console.log(`   Phone: ${phone}`);
    console.log(`   OTP: ${otp}`);
    console.log('='.repeat(50));
    return true;
  }
}

export async function sendOTP(
  destination: string,
  otp: string,
  sendVia: 'email' | 'sms'
): Promise<boolean> {
  if (sendVia === 'email') {
    return sendOTPEmail(destination, otp);
  } else {
    return sendOTPSMS(destination, otp);
  }
}
