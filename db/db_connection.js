import { MongoClient,ServerApiVersion } from "mongodb";

const client = new MongoClient("mongodb+srv://deenanks:lqhYBo2g1rw5JPPe@cluster0.tmyga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default client
