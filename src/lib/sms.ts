// src/lib/sms.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials are not configured.');
    return false;
  }

  try {
    await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to: to.startsWith('+') ? to : `+${to}`, // Ensure international format
    });
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    return false;
  }
}