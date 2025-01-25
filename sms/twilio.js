import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createMessage(phoneNumber,message_to_send) {
  const message = await client.messages.create({
    body: `${message_to_send}`,
    from: "+13258801761",
    to: `+91${phoneNumber}`,
  });

  console.log(message.body);
}

export default createMessage;