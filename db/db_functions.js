
import client from "./db_connection.js";

async function addLog(phoneNumber, longitude, latitude, city) {
  try {
      const database = client.db("women_safety");
      const logs = database.collection("logs");
      
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

async function addDetailedLog(phoneNumber, longitude, latitude, area, landmark, description, city) {
  try {
      const database = client.db("women_safety");
      const detailedLogs = database.collection("detailed_logs");
      
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

export {addDetailedLog,addLog,addSosContact,registerUser,removeSosContact,getSosContacts}