import { MongoClient,ServerApiVersion } from "mongodb";

const client = new MongoClient("", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default client
