# Backend Developer Guide

## Overview

This guide covers the backend architecture, configuration, and deployment steps for the Hospital Management System. The backend is built with **Node.js** and **Express**, using **MongoDB Atlas** for the database.

It is designed to be deployed on an **AWS EC2 instance**, serving requests from the frontend hosted on S3.

## Configuration

The backend relies on environment variables for database connections, email services, and Twilio integration.

### Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory with the following keys:

```properties
# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospital_auth?retryWrites=true&w=majority

# Server Port (Default is 3001)
PORT=3001

# Email Service (SMTP - e.g., Brevo/SendGrid)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
EMAIL_FROM=no-reply@yourhospital.com

# Twilio (WhatsApp & SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

> **Note**: The server currently listens on port **3001** by default. Ensure this port is open in your firewall/Security Group.

## Running Locally

1.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```
2.  **Start Server**:
    ```bash
    npm start
    # OR
    node index.js
    ```
3.  **Verify**:
    The server should output:
    ```
    ✅ Connected to MongoDB (hospital_auth)
    Backend server running on http://localhost:3001
    ```

## Deployment Guide (AWS EC2)

To deploy this backend to an AWS EC2 instance:

### 1. Prerequisite Setup

- Launch an EC2 instance (Ubuntu/Amazon Linux).
- **Security Group**: Allow Inbound traffic on **Port 3001** (Custom TCP) and **SSH (22)**.
- SSH into your instance.

### 2. Environment Setup

Install Node.js and Git:

```bash
# Update packages
sudo apt update

# Install Node.js (v18+ recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### 3. Deploy Code

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd Hospital_Management_System_/backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create the `.env` file with your production keys (MongoDB Atlas connection string, etc.).
    ```bash
    nano .env
    # Paste your env vars here, then Save (Ctrl+O) and Exit (Ctrl+X)
    ```

### 4. Start Application

Use **PM2** to keep the app running in the background:

```bash
pm2 start index.js --name "hospital-backend"
pm2 save
pm2 startup
```

### 5. Verification

- Your backend is now live at `http://<your-ec2-public-ip>:3001`.
- You can now use this URL to update the **Frontend** configuration (`VITE_API_URL` in `.env.production`).

## Database Management

We have migrated to **MongoDB Atlas** to support cloud deployment.

### Changes Made for Migration

1.  **Updated `config/db.js`**:
    - Removed hardcoded local connection string (`mongodb://localhost:27017/...`).
    - Switched to using `process.env.MONGO_URI` to allow dynamic configuration.
2.  **Environment Variable**:
    - The application now strictly requires `MONGO_URI` to be defined in the `.env` file.
    - This allows us to connect to the Atlas cluster from any environment (Local, EC2, etc.) without changing code.

### Why this matters for EC2

- **No Local Database**: You do **not** need to install MongoDB on the EC2 instance.
- **Security**: Database credentials are not stored in the source code.
- **Scalability**: The database is managed independently of the application server.

## Troubleshooting

- **Connection Refused**: Check EC2 Security Groups to ensure Port 3001 is open to `0.0.0.0/0`.
- **MongoDB Error**: Verify `MONGO_URI` in `.env` is correct and your EC2 IP is whitelisted in MongoDB Atlas Network Access (or set to allow all IPs `0.0.0.0/0`).
