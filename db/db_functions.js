
import get_address from "../rev_geocoding/rev_geocoding_functions.js";
import client from "./db_connection.js";

async function addLog(phoneNumber, longitude, latitude) {
  try {
      const database = client.db("women_safety");
      const logs = database.collection("logs");
      const city = get_address(latitude,longitude);
      const logDoc = {
          phoneNumber: phoneNumber,
          longitude: longitude,
          latitude: latitude,
          city: city,
          timestamp: new Date()
      };
      
      const result = await logs.insertOne(logDoc);
      return result;
  } catch (error) {
      console.error("Error adding log:", error);
      throw error;
  }
}

async function addDetailedLog(phoneNumber, longitude, latitude, area, landmark, description) {
  try {
      const database = client.db("women_safety");
      const detailedLogs = database.collection("detailed_logs");
      const city = get_address(latitude,longitude);
      const detailedLogDoc = {
          phoneNumber: phoneNumber,
          longitude: longitude,
          latitude: latitude,
          area: area,
          landmark: landmark,
          description: description,
          city: city,
          timestamp: new Date()
      };
      
      const result = await detailedLogs.insertOne(detailedLogDoc);
      return result;
  } catch (error) {
      console.error("Error adding detailed log:", error);
      throw error;
  }
}

async function getLogs(phoneNumber, startDate = null, endDate = null) {
    try {
        const database = client.db("women_safety");
        const logs = database.collection("logs");
        
        let query = { phoneNumber: phoneNumber };
        
      
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const result = await logs.find(query)
            .sort({ timestamp: -1 }) 
            .toArray();
            
        return result;
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
    }
}

async function getDetailedLogs(phoneNumber, startDate = null, endDate = null) {
    try {
        const database = client.db("women_safety");
        const detailedLogs = database.collection("detailed_logs");
        
        let query = { phoneNumber: phoneNumber };
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const result = await detailedLogs.find(query)
            .sort({ timestamp: -1 }) 
            .toArray();
            
        return result;
    } catch (error) {
        console.error("Error fetching detailed logs:", error);
        throw error;
    }
}


async function getSosContacts(userPhoneNumber) {
  try {
      const database = client.db("women_safety");
      const sosContacts = database.collection("sos_contacts");
      
      const contacts = await sosContacts.find({ 
          userPhoneNumber: userPhoneNumber 
      }).toArray();
      
      return contacts;
  } catch (error) {
      console.error("Error fetching SOS contacts:", error);
      throw error;
  }
}


async function addSosContact(userPhoneNumber, contactName, contactPhoneNumber) {
  try {
      const database = client.db("women_safety");
      const sosContacts = database.collection("sos_contacts");
      
      const contactDoc = {
          userPhoneNumber: userPhoneNumber,
          contactName: contactName,
          contactPhoneNumber: contactPhoneNumber,
          dateAdded: new Date()
      };
      
      const result = await sosContacts.insertOne(contactDoc);
      return result;
  } catch (error) {
      console.error("Error adding SOS contact:", error);
      throw error;
  }
}


async function removeSosContact(userPhoneNumber, contactPhoneNumber) {
  try {
      const database = client.db("women_safety");
      const sosContacts = database.collection("sos_contacts");
      
      const result = await sosContacts.deleteOne({
          userPhoneNumber: userPhoneNumber,
          contactPhoneNumber: contactPhoneNumber
      });
      
      return result;
  } catch (error) {
      console.error("Error removing SOS contact:", error);
      throw error;
  }
}


async function registerUser(phoneNumber) {
  try {
      const database = client.db("women_safety");
      const registeredUsers = database.collection("registered_users");
 
      const existingUser = await registeredUsers.findOne({ phoneNumber: phoneNumber });
      
      if (existingUser) {
          const updateResult = await registeredUsers.updateOne(
              { phoneNumber: phoneNumber },
              { $set: { lastActive: new Date() } }
          );
          return { 
              acknowledged: true,
              modifiedCount: updateResult.modifiedCount,
              existingUser: true
          };
      }

      const userDoc = {
          phoneNumber: phoneNumber,
          registrationDate: new Date(),
          lastActive: new Date()
      };
      
      const result = await registeredUsers.insertOne(userDoc);
      return {
          ...result,
          existingUser: false
      };
  } catch (error) {
      console.error("Error registering user:", error);
      throw error;
  }
}

async function save_settings(email, address) {
  try {
      const database = client.db("women_safety");
      const profile = database.collection("profile");
      const result = await profile.insertOne({email, address});
      return result;
  } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
  }
}

export {addDetailedLog,addLog,addSosContact,registerUser,removeSosContact,getSosContacts,getLogs,getDetailedLogs,save_settings}