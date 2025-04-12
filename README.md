# Appwrite Dashboard

A simple dashboard to monitor and manage your Appwrite instance.

## How to Run the Project

### Prerequisites

- Node.js (latest LTS version recommended)
- Appwrite instance running
- Git

### Installation & Setup

1. **Clone the repository**
   ```
   git clone <your-repo-url>
   cd appwrite-dashboard
   ```

2. **Set up the frontend**
   ```
   npm install
   ```

3. **Set up the server**
   ```
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**
   - Create a `.env` file in the server directory with your Appwrite credentials:
   ```
   APPWRITE_ENDPOINT=your-appwrite-endpoint
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   ```
   - Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the server**
   ```
   cd server
   npm run dev
   ```

2. **Start the frontend** (in a new terminal)
   ```
   npm start
   ```

3. **Access the dashboard**
   - Open your browser and navigate to `http://localhost:3000`
