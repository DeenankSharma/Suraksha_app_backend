// Set TLS options for Windows compatibility
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import get_address from "./rev_geocoding/rev_geocoding_functions.js"
import cors from "cors"
import connectDB from './db/db_connection.js';
import { addDetailedLog, addLog, addSosContact, registerUser, removeSosContact, getSosContacts, getLogs, getDetailedLogs, save_settings } from "./db/db_functions.js"
import sendSMS from "./sms/sms_connection.js"
import createMessage from "./sms/twilio.js"
import { getRandomInt } from "./utils/generate_otp.js"

// Store OTP with phone number mapping
const otpStore = new Map();

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await connectDB();
        res.status(200).json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'Error',
            database: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Default emergency contacts (Police, Ambulance, Women Helpline)
const DEFAULT_EMERGENCY_CONTACTS = [
    { contactName: "Police", contactPhoneNumber: "100" },
    { contactName: "Ambulance", contactPhoneNumber: "102" },
    { contactName: "Women Helpline", contactPhoneNumber: "1091" }
];

app.post('/emergency', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { phoneNumber, longitude, latitude } = req.body;

        if (!phoneNumber || longitude === undefined || latitude === undefined) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Get all emergency contacts for this user
        const userContacts = await getSosContacts(phoneNumber);
        const allContacts = [...DEFAULT_EMERGENCY_CONTACTS, ...userContacts];

        // Create emergency message with location
        const emergencyMessage = `EMERGENCY ALERT from ${phoneNumber}! Location: https://www.google.com/maps?q=${latitude},${longitude}`;

        // Send SMS to all emergency contacts
        const sendPromises = allContacts.map(contact => 
            createMessage(contact.contactPhoneNumber, emergencyMessage).catch(err => {
                console.error(`Failed to send to ${contact.contactName}:`, err);
                return null;
            })
        );

        await Promise.all(sendPromises);

        // Log the emergency
        const result = await addLog(phoneNumber, longitude, latitude);

        res.status(201).json({
            success: true,
            message: 'Emergency logged and alerts sent successfully',
            data: result,
            contactsNotified: allContacts.length
        });
    } catch (error) {
        console.error('Error in emergency route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});


app.post('/descriptive_emergency', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const {
            phoneNumber,
            longitude,
            latitude,
            area,
            landmark,
            description
        } = req.body;

        if (!phoneNumber || longitude === undefined || latitude === undefined || !area || !description) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const city = await get_address(latitude, longitude);

        // Get all emergency contacts
        const userContacts = await getSosContacts(phoneNumber);
        const allContacts = [...DEFAULT_EMERGENCY_CONTACTS, ...userContacts];

        // Create detailed emergency message
        const emergencyMessage = `EMERGENCY ALERT from ${phoneNumber}! Location: ${area}, ${landmark || ''}, ${city}. Description: ${description}. Map: https://www.google.com/maps?q=${latitude},${longitude}`;

        // Send SMS to all emergency contacts
        const sendPromises = allContacts.map(contact => 
            createMessage(contact.contactPhoneNumber, emergencyMessage).catch(err => {
                console.error(`Failed to send to ${contact.contactName}:`, err);
                return null;
            })
        );

        await Promise.all(sendPromises);

        // Log the emergency
        const result = await addDetailedLog(
            phoneNumber,
            longitude,
            latitude,
            area,
            landmark,
            description,
            city
        );

        res.status(201).json({
            success: true,
            message: 'Detailed emergency logged and alerts sent successfully',
            data: result,
            contactsNotified: allContacts.length
        });
    } catch (error) {
        console.error('Error in descriptive emergency route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.get('/get_logs', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { phoneNumber } = req.query;
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }
        const logs = await getLogs(phoneNumber);
        console.log(logs);
        res.status(200).json({
            success: true,
            logs: logs
        });
    } catch (error) {
        console.error('Error in get logs route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
})

app.get('/get_detailed_logs', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { phoneNumber } = req.query;
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }
        const logs = await getDetailedLogs(phoneNumber);
        res.status(200).json({
            success: true,
            logs: logs
        });
    } catch (error) {
        console.error('Error in get logs route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
})

app.get('/saved_contacts', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }

        const contacts = await getSosContacts(phoneNumber);

        res.status(200).json({
            success: true,
            contacts: contacts
        });
    } catch (error) {
        console.error('Error in get contacts route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.post('/add_contact', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { userPhoneNumber, contactName, contactPhoneNumber } = req.body;

        if (!userPhoneNumber || !contactName || !contactPhoneNumber) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const result = await addSosContact(userPhoneNumber, contactName, contactPhoneNumber);

        res.status(201).json({
            success: true,
            message: 'Contact added successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in add contact route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.delete('/remove_contact', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        const { userPhoneNumber, contactPhoneNumber } = req.body;

        if (!userPhoneNumber || !contactPhoneNumber) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const result = await removeSosContact(userPhoneNumber, contactPhoneNumber);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact removed successfully'
        });
    } catch (error) {
        console.error('Error in remove contact route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.post('/login', async (req, res) => {
    console.log("Hits on /login");
    try {
        await connectDB(); // Connect to database
        
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }

        const result = await registerUser(phoneNumber);
        const generatedOtp = getRandomInt();
        
        // Store OTP with phone number and expiration time (5 minutes)
        otpStore.set(phoneNumber, {
            otp: generatedOtp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            isNewUser: !result.existingUser // Check if registerUser returned existingUser: false
        });
        
        console.log(`OTP stored for phone: ${phoneNumber}, OTP: ${generatedOtp}`);
        console.log(`OTP store now contains: ${Array.from(otpStore.keys())}`);

        const otp_message = `Your Suraksha App OTP is: ${generatedOtp}. Valid for 5 minutes.`;
        
        try {
            console.log(`OTP for ${phoneNumber}: ${generatedOtp}`);
            const otp_response = await createMessage(phoneNumber, otp_message);
            console.log("OTP sent successfully. The response is: ", otp_response);
        } catch (smsError) {
            console.error("Failed to send OTP SMS:", smsError);
            // Continue even if SMS fails for testing purposes
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.get('/get_location', async (req, res) => {
    try {
        // No database connection needed for this route
        const lat = req.query.lat;
        const long = req.query.long;

        if (!lat || !long) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const location = await get_address(lat, long);
        res.json({ success: true, location: location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/verify_otp', async (req, res) => {
    try {
        // No database connection needed - OTP is stored in memory
        const { otp: userOtp, phoneNumber } = req.body;
        
        console.log(`OTP Verification attempt - Phone: ${phoneNumber}, OTP: ${userOtp}`);
        console.log(`Current OTP store keys: ${Array.from(otpStore.keys())}`);
        
        if (!userOtp || !phoneNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP and phone number are required' 
            });
        }

        const storedData = otpStore.get(phoneNumber);
        console.log(`Stored data for ${phoneNumber}:`, storedData);

        if (!storedData) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP not found or expired. Please request a new OTP.' 
            });
        }

        // Check if OTP is expired
        if (Date.now() > storedData.expiresAt) {
            if(storedData.isNewUser) {
                await connectDB();
                await deleteUser(phoneNumber);
            }
            otpStore.delete(phoneNumber);
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired. Please request a new OTP.' 
            });
        }

        // Compare OTPs
        if (userOtp.toString() === storedData.otp.toString()) {
            otpStore.delete(phoneNumber); // Remove OTP after successful verification
            res.status(200).json({ 
                success: true, 
                message: 'OTP verified successfully' 
            });
        } else {
            if (storedData.isNewUser) {
                await connectDB();
                await deleteUser(phoneNumber);
                
                // We must also delete the OTP session to force them to /login again
                // (otherwise they could retry with the correct OTP, but their DB entry would be gone)
                otpStore.delete(phoneNumber);
                
                res.status(400).json({ 
                    success: false, 
                    message: 'Invalid OTP. Registration cancelled. Please login again.' 
                });
            } else {
                // If it was an existing user, just fail the OTP without deleting the account
                res.status(400).json({ 
                    success: false, 
                    message: 'Invalid OTP' 
                });
            }
        }
    } catch (error) {
        console.error('Error in OTP verification:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.post('/save_settings', async (req, res) => {
    try {
        await connectDB(); // Connect to database
        
        let { email, address } = req.body;
        if(!email) email = ""
        if(!address) address = ""
        const result = await save_settings(email, address);
        res.json({ 
            success: true, 
            message: 'Settings saved successfully',
            data: result 
        });
    } catch (error) {
        console.error('Error in save settings route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// // Remove this for Vercel - not needed in serverless
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running at: ${PORT}`);
// });

export default app;