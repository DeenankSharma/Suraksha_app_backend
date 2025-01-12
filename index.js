import express from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import get_address from "./rev_geocoding/rev_geocoding_functions.js"
import cors from "cors"
import client from "./db/db_connection.js"
import { addDetailedLog, addLog, addSosContact, registerUser, removeSosContact, getSosContacts, getLogs, getDetailedLogs } from "./db/db_functions.js"
// import { getLogs } from "viem/actions"



dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

client.connect();

app.post('/emergency', async (req, res) => {
    try {
        const { phoneNumber, longitude, latitude, city } = req.body;

        if (!phoneNumber || !longitude || !latitude || !city) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const result = await addLog(phoneNumber, longitude, latitude, city);

        res.status(201).json({
            success: true,
            message: 'Emergency logged successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in emergency route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


app.post('/descriptive_emergency', async (req, res) => {
    try {
        const {
            phoneNumber,
            longitude,
            latitude,
            area,
            landmark,
            description,
            city
        } = req.body;

        if (!phoneNumber || !longitude || !latitude || !area || !description || !city) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

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
            message: 'Detailed emergency logged successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in descriptive emergency route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.get('/get_logs', async (req, res) => {
    try {
        const { phoneNumber } = req.query;
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }
        const logs = await getLogs(phoneNumber);
        res.status(200).json({
            success: true,
            logs: logs
        });
    } catch {
        console.error('Error in get logs route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
})

app.get('/get_detailed_logs', async (req, res) => {
    try {
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
    } catch {
        console.error('Error in get logs route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
})



app.get('/saved_contacts', async (req, res) => {
    try {
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
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }

        const result = await registerUser(phoneNumber);

        res.status(200).json({
            success: true,
            message: 'User registered/logged in successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

app.get('/get_location', async (req, res) => {
    try {
        const lat = req.query.lat;
        const long = req.query.long;

        if (!lat || !long) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const location = await get_address(lat, long);
        console.log(location.data);
        res.send(location.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at: ${PORT}`);
});