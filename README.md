# Workcity Chat Backend (Node.js + Express + Socket.IO + MongoDB)

Backend service powering the Workcity Chat application.  
Provides REST APIs, authentication, real-time messaging, and database persistence.

---

## ⚙️ Setup

### Local (without Docker)
```bash
git clone https://github.com/Caryourdaysbm/workcity-chat-backend.git
cd workcity-chat-backend-v3
cp .env.example .env   # configure environment variables
npm install
npm run dev
```
Runs on `http://localhost:4000`

### Local (with Docker Compose)
```bash
docker-compose up --build
```
- Backend → `http://localhost:4000`  
- MongoDB → `localhost:27017`  
- Mongo Express → `http://localhost:8081`

### Deployment (example for Render with Dockerfile)
1. Push repo to GitHub.  
2. Create a Render Web Service → choose **Docker environment**.  
3. Add environment variables:
   ```env
   MONGO_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<secure-secret>
   CLIENT_ORIGIN=https://workcity-frontend.vercel.app
   ```
4. App will be available at `https://<your-backend>.onrender.com`

---

## 🛠️ Technologies
- Node.js + TypeScript  
- Express  
- MongoDB + Mongoose  
- Socket.IO  
- Zod for validation  
- JWT + bcrypt  
- Swagger Docs  

---

## ⚡ Challenges & Solutions
- **Realtime state management**: solved using Socket.IO rooms.  
- **Message ordering & pagination**: handled with MongoDB timestamps.  
- **Secure production database**: switched to MongoDB Atlas.  
- **CORS issues**: resolved with environment-based config.  

---

## 📝 Instructions
- API base: `/api`  
- Swagger docs: `/api/docs`  
- Seed test users:
  ```bash
  npm run seed
  ```
- Socket.IO events:  
  - `message:send`  
  - `message:new`  
  - `typing:start`, `typing:stop`
