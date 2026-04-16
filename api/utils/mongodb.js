import 'node:net';
import 'node:tls';
import { MongoClient, ObjectId } from 'mongodb';

let client;

const getClient = async (env) => {
  if (client) return client;
  
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  return client;
};

const db = (collectionName, env) => ({
  findOne: async (filter) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).findOne(filter);
  },
  findById: async (id) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).findOne({ _id: new ObjectId(id) });
  },
  find: async (filter = {}, options = {}) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).find(filter, options).toArray();
  },
  insertOne: async (document) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    const res = await c.db(dbName).collection(collectionName).insertOne(document);
    return { ...document, _id: res.insertedId };
  },
  updateOne: async (filter, update, options = {}) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).updateOne(filter, update, options);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).updateOne({ _id: new ObjectId(id) }, update, options);
  },
  deleteOne: async (filter) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).deleteOne(filter);
  },
  deleteMany: async (filter) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).deleteMany(filter);
  },
  countDocuments: async (filter = {}) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).countDocuments(filter);
  },
  aggregate: async (pipeline) => {
    const c = await getClient(env);
    const dbName = env.MONGODB_DATABASE || 'gigmart';
    return await c.db(dbName).collection(collectionName).aggregate(pipeline).toArray();
  }
});

export default db;
export { ObjectId };
