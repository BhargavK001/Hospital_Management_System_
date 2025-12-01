# 🚀 AWS Deployment Guide for OneCare / Hospital Management System

This guide explains how to deploy your **backend on a new EC2 instance** and your **frontend on S3** from scratch. Follow this whenever you create a new server or redeploy your full project.

---

# 🧩 1. EC2 Setup (AWS Console)

## 1. Create / Use Key Pair

* Go to **AWS Console → EC2 → Key pairs**
* Create key pair (RSA, .pem), example:

  * `onecare-key-mumbai.pem`
* Save the `.pem` file safely.

---

## 2. Launch EC2 Instance

* OS: **Ubuntu 24.04 LTS**
* Instance type: `t2.micro` (or larger for production)
* Select existing key pair

### Security Group Rules

| Type             | Port     | Source    |
| ---------------- | -------- | --------- |
| SSH              | 22       | Your IP   |
| HTTP             | 80       | 0.0.0.0/0 |
| HTTPS (optional) | 443      | 0.0.0.0/0 |
| Custom TCP       | **3001** | 0.0.0.0/0 |

Launch and note your **Public IP**.

---

# 🧩 2. Connect to EC2

```bash
ssh -i "onecare-key-mumbai.pem" ubuntu@<PUBLIC_IP>
```

---

# 🧩 3. Basic Server Setup (Node, Git, PM2)

```bash
sudo apt update && sudo apt upgrade -y

# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

node -v
npm -v
```

---

# 🧩 4. Deploy Backend on EC2

## 1. Clone Repo

```bash
cd ~
git clone https://github.com/BhargavK001/Hospital_Management_System_.git
cd Hospital_Management_System_/backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Add `.env` File

Create backend env file:

```bash
nano .env
```

Paste the latest backend values (from your local machine).

Save:

* **Ctrl + O**, Enter
* **Ctrl + X**

---

## 4. Start Backend with PM2

```bash
pm2 start index.js --name backend
pm2 startup
```

PM2 will print a command — copy-paste that command.

Then:

```bash
pm2 save
pm2 ls
pm2 logs backend
```

Backend is now running.

---

# 🧩 5. (Optional) Setup Nginx Reverse Proxy

If you want backend to run on port **80** instead of 3001:

Install Nginx:

```bash
sudo apt install -y nginx
```

Open config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Add inside `location /`:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

# 🧩 6. Frontend Deployment (S3)

## Step 1: Update `.env.production`

On your **local machine**, inside `frontend/` create/update:

```
VITE_API_URL=http://<PUBLIC_IP>:3001
```

(If Nginx is used, remove `:3001`)

---

## Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This generates the `build/` folder.

---

## Step 3: Upload to S3

1. Go to **AWS Console → S3**
2. Open your frontend bucket
3. Delete all old files
4. Upload **only the contents of `build/`**

⚠️ `index.html` must be in bucket ROOT — not inside a folder.

---

## Step 4: Ensure Static Website Hosting

* S3 → Bucket → Properties → Static website hosting
* Enable
* Index document: `index.html`
* Error document: `index.html`

---

# 🧩 7. Testing

### Backend

Visit:

```
http://<PUBLIC_IP>:3001
```

(or port 80 if using Nginx)

### Frontend

Visit your **S3 website URL** or **CloudFront URL**.

Open browser console → Network tab → ensure API hits:

```
http://<PUBLIC_IP>:3001
```

---

# 🎉 Deployment Completed

This README can be reused every time you:

* Create a new EC2 server
* Redeploy backend
* Upload new frontend build
* Update environment variables

If anything breaks, check:

* `pm2 logs backend`
* Browser console
* S3 bucket permissions
* `.env.production` API URL correctness
