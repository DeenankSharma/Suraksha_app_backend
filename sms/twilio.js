import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = twilio(accountSid, authToken);

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