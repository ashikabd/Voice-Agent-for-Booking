# **Voice Agent – Backend (Node.js + MongoDB)**

A simple REST API for creating and managing restaurant bookings.
Built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

---

## **📦 Setup**

### **1. Install dependencies**

```bash
npm install
```

### **2. Start MongoDB (Docker)**

```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  --name voice-mongo \
  mongo
```

### **3. Add environment file**

Create a `.env` file:

```
MONGO_URI=mongodb://admin:password@localhost:27017/vaiu_voice_agent?authSource=admin
PORT=5000
```

### **4. Start server**

```bash
npm start
```

---

## **🔌 API Endpoints**

### **Create Booking**

`POST /api/bookings`

```json
{
  "customerName": "John Doe",
  "numberOfGuests": 2,
  "bookingDate": "2024-12-15",
  "bookingTime": "19:00",
  "cuisinePreference": "Italian",
  "specialRequests": "Window seat"
}
```

### **Get All Bookings**

`GET /api/bookings`

### **Get Booking by ID**

`GET /api/bookings/:id`

### **Cancel Booking**

`DELETE /api/bookings/:id`

---

## **✔ Tech Stack**

* Node.js
* Express
* MongoDB
* Mongoose

