const sdk = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new sdk.Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
const users = new sdk.Users(client);
const account = new sdk.Account(client);
const databases = new sdk.Databases(client);
const teams = new sdk.Teams(client);
const functions = new sdk.Functions(client);
const avatars = new sdk.Avatars(client); 
const locale = new sdk.Locale(client);

module.exports = { 
  client, 
  account, 
  users,
  databases,
  teams,
  functions,
  avatars,
  locale
};