import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

let client = null;
if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length >= 20) {
  try {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.log('Twilio initialization failed:', error.message);
    client = null;
  }
} else {
  console.log('Twilio credentials not configured or invalid. SMS will be logged to console instead.');
}

async function createMessage(phoneNumber, message_to_send) {
  if (client) {
    try {
      const message = await client.messages.create({
        body: `${message_to_send}`,
        from: twilioPhoneNumber,
        to: `+91${phoneNumber}`,
      });
      console.log('SMS sent successfully:', message.body);
      return { status: 200, message: 'SMS sent successfully' };
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return { status: 500, message: 'SMS sending failed' };
    }
  } else {
    console.log(`\nSMS would be sent to +91${phoneNumber}:`);
    console.log(`Message: ${message_to_send}\n`);
    return { status: 200, message: 'SMS logged to console (Twilio not configured)' };
  }
}

export default createMessage;