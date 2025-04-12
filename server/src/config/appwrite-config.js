const sdk = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new sdk.Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
const account = new sdk.Account(client);
const users = new sdk.Users(client);

module.exports = { client, account, users };