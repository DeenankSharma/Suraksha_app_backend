import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const sendSMS = async (phoneNumber, message) => {
  try {
    const data = JSON.stringify({
      sender_id: "TSGNAL",
      to: [phoneNumber],
      route: "transactional",
      message: message,
      template_id: "7D6Q-1ONg"
    });

    const config = {
      method: 'post',
      url: `https://api.trustsignal.io/v1/sms?api_key=${process.env.TRUSTSIGNAL_API_KEY}`,
      headers: { 
        'Content-Type': 'application/json' 
      },
      data: data
    };

    const response = await axios(config);
    console.log("SMS sent successfully. The response is: ", response);
    return response;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

export default sendSMS;