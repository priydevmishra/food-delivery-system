# 🚀 Food Delivery System — Complete Windows Setup Guide

## What YOU are building (your 3 services + frontend)
```
notification-service  →  Port 3003  (Express + RabbitMQ)
location-service      →  Port 3004  (Express + Socket.io + Redis)
delivery-service      →  Port 3005  (Express + Kafka + RabbitMQ)
frontend              →  Port 4000  (Next.js + Redux + Tailwind)
```

---

## STEP 1 — Install Required Software (Windows)

### 1A. Install Node.js
1. Go to https://nodejs.org
2. Download **LTS version** (e.g. 20.x)
3. Run the installer — click Next → Next → Install
4. Open **Command Prompt** and verify:
   ```
   node --version
   npm --version
   ```
   Both should print version numbers (e.g. v20.x.x and 10.x.x)

### 1B. Install Git
1. Go to https://git-scm.com/download/win
2. Download and run installer
3. During install: choose "Use Git from the Windows Command Prompt"
4. Verify:
   ```
   git --version
   ```

### 1C. Install Docker Desktop (for Redis, RabbitMQ, Kafka)
1. Go to https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for Windows
3. Run installer — it will ask to enable WSL2 (say Yes)
4. Restart your computer after install
5. Open Docker Desktop — wait for it to say "Engine running"
6. Verify in Command Prompt:
   ```
   docker --version
   docker-compose --version
   ```

---

## STEP 2 — Get the Project

### 2A. Create the GitHub repo (first time only)
1. Go to github.com → New Repository
2. Name it: `food-delivery-system`
3. Set to Private
4. Do NOT add README (we have one)
5. Copy the repo URL

### 2B. Clone and push
Open **Command Prompt** (or Windows Terminal):
```
cd C:\Users\YourName\Projects
git clone https://github.com/your-username/food-delivery-system.git
cd food-delivery-system
```

OR if starting fresh:
```
cd C:\Users\YourName\Projects
mkdir food-delivery-system
cd food-delivery-system
git init
git remote add origin https://github.com/your-username/food-delivery-system.git
```

---

## STEP 3 — Set Up the .env Files

Each service needs a `.env` file. Copy from the `.env.example` files:

### Windows Command Prompt:
```
cd packages\notification-service
copy .env.example .env

cd ..\location-service
copy .env.example .env

cd ..\delivery-service
copy .env.example .env

cd ..\frontend
copy .env.local.example .env.local

cd ..\..
```

You do NOT need to change anything in .env files for local development.

---

## STEP 4 — Install All Dependencies

In the **root folder** of the project (where root `package.json` is):
```
npm install
```

This installs dependencies for ALL packages at once (npm workspaces magic).
Wait for it to finish — may take 2-3 minutes.

---

## STEP 5 — Start Infrastructure (Redis, RabbitMQ, Kafka)

Make sure Docker Desktop is running, then:
```
cd infrastructure
docker-compose up -d redis rabbitmq
```

Wait about 30 seconds, then verify they are running:
```
docker ps
```
You should see `redis` and `rabbitmq` in the list.

> **Note on Kafka:** Kafka is optional for development. The delivery-service
> will print a warning but still run without it. Only start Kafka when you
> need to test the full order→delivery flow:
> ```
> docker-compose up -d zookeeper kafka
> ```

---

## STEP 6 — Run Your Services

Open **4 separate Command Prompt windows** (or use Windows Terminal tabs):

### Window 1 — Notification Service
```
cd C:\Users\YourName\Projects\food-delivery-system\packages\notification-service
npm run dev
```
Should print: `[Notification Service] Running on http://localhost:3003`

### Window 2 — Location Service
```
cd C:\Users\YourName\Projects\food-delivery-system\packages\location-service
npm run dev
```
Should print: `[Location Service] Running on http://localhost:3004`

### Window 3 — Delivery Service
```
cd C:\Users\YourName\Projects\food-delivery-system\packages\delivery-service
npm run dev
```
Should print: `[Delivery Service] Running on http://localhost:3005`

### Window 4 — Frontend
```
cd C:\Users\YourName\Projects\food-delivery-system\packages\frontend
npm run dev
```
Should print: `ready - started server on http://localhost:4000`

---

## STEP 7 — Test Everything is Working

Open your browser and visit each health check URL:

| Service              | URL                                   | Expected response             |
|----------------------|---------------------------------------|-------------------------------|
| Notification Service | http://localhost:3003/health          | `{"status":"ok",...}`         |
| Location Service     | http://localhost:3004/health          | `{"status":"ok",...}`         |
| Delivery Service     | http://localhost:3005/health          | `{"status":"ok",...}`         |
| Frontend             | http://localhost:4000                 | Your app homepage             |
| RabbitMQ UI          | http://localhost:15672                | Login: guest / guest          |

---

## STEP 8 — Test APIs with Postman

Download Postman from https://www.postman.com/downloads/

### Test Notification Service
```
POST http://localhost:3003/api/notifications/send
Body (JSON):
{
  "userId": "USR001",
  "type": "ORDER_PLACED",
  "data": { "orderId": "ORD001" }
}

GET http://localhost:3003/api/notifications/USR001
```

### Test Delivery Service
```
POST http://localhost:3005/api/delivery/assign
Body (JSON):
{
  "orderId": "ORD001",
  "customerId": "USR001",
  "restaurantAddress": "Connaught Place, Delhi",
  "deliveryAddress": "Lajpat Nagar, Delhi"
}

GET http://localhost:3005/api/delivery/order/ORD001

PUT http://localhost:3005/api/delivery/{deliveryId}/status
Body: { "status": "PICKED_UP" }
```

### Test Location Service
```
POST http://localhost:3004/api/location/update
Body:
{
  "deliveryId": "del_xxx",
  "lat": 28.6139,
  "lng": 77.2090
}

GET http://localhost:3004/api/location/{deliveryId}
```

---

## STEP 9 — Git Workflow (How to Share Code)

### First push (run once):
```
git add .
git commit -m "feat: initial project setup"
git push -u origin main
```

### Create your feature branch:
```
git checkout -b feature/you/notification-service
```

### Daily work:
```
git checkout develop
git pull origin develop          ← always pull first

git checkout feature/you/your-feature-name
git add .
git commit -m "feat: add notification polling"
git push origin feature/you/your-feature-name
```

### Merge partner's work:
When partner pushes to develop:
```
git checkout develop
git pull origin develop

git checkout feature/you/your-feature-name
git rebase develop               ← bring in partner's changes
```

---

## File Ownership (Never Edit These)

| Files/Folders                       | Owner         |
|-------------------------------------|---------------|
| packages/notification-service/      | YOU ✅        |
| packages/location-service/          | YOU ✅        |
| packages/delivery-service/          | YOU ✅        |
| frontend/src/features/delivery/     | YOU ✅        |
| frontend/src/features/notifications/| YOU ✅        |
| frontend/src/features/location/     | YOU ✅        |
| frontend/src/store/slices/deliverySlice.js     | YOU ✅ |
| frontend/src/store/slices/locationSlice.js     | YOU ✅ |
| frontend/src/store/slices/notificationSlice.js | YOU ✅ |
| packages/auth-service/              | Partner 🔵    |
| packages/order-service/             | Partner 🔵    |
| packages/restaurant-service/        | Partner 🔵    |
| packages/payment-service/           | Partner 🔵    |
| frontend/src/store/index.js         | ⚠ Both — be careful |
| infrastructure/docker-compose.yml   | ⚠ Both — be careful |

---

## Common Errors on Windows

### "node is not recognized"
→ Restart Command Prompt after installing Node.js

### "npm install" fails with EACCES
→ Run Command Prompt as Administrator (right-click → Run as administrator)

### "docker is not recognized"
→ Restart your computer after installing Docker Desktop

### Port already in use (EADDRINUSE)
→ Find and kill the process using that port:
```
netstat -ano | findstr :3003
taskkill /PID <pid_number> /F
```

### RabbitMQ connection refused
→ Make sure Docker is running and containers are up:
```
docker ps
docker-compose up -d redis rabbitmq
```

### nodemon is not recognized
→ Run this once:
```
npm install -g nodemon
```
