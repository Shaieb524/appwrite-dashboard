// appwrite-config.js
// WARNING: This uses the Node.js SDK which may cause issues in a browser environment
// You may need to configure your bundler (webpack, etc.) to handle Node.js modules
const sdk = require('node-appwrite');

// Update these values with your Appwrite project details
const config = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://appwrite.example.com/v1', // Your API Endpoint
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY, 
};

// Initialize client as shown in your example
let client = new sdk.Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey) 
;

// Create service instances using the Node.js SDK
const account = new sdk.Account(client);
const users = new sdk.Users(client);

// Export the necessary services and config to maintain compatibility with the rest of your app
export { client, account, users as serverUsers, account as serverAccount, config };