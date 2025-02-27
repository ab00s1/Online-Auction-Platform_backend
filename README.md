# Online Auction Platform - Backend

This is the backend server for the **Online Auction Platform**, built using **Node.js, Express, MongoDB, and JWT authentication**. It provides RESTful APIs for user authentication, item listing, bidding functionality, and secure access control.

## 🚀 Features

- **User Authentication:** Register, login with JWT-based authentication.
- **Auction Items Management:** Add, edit, delete, and fetch auction items.
- **Bidding System:** Update bids with automatic highest bidder tracking.
- **Access Control:** Protect routes using JWT authentication.
- **Database:** MongoDB integration with Mongoose models.
- **CORS Enabled:** Supports frontend communication.

## 🏗 Tech Stack

- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB & Mongoose** - NoSQL database & ODM
- **JWT (jsonwebtoken)** - Secure user authentication
- **bcryptjs** - Password hashing
- **nodemon** - Development server auto-restart

---

## 📂 **Project Structure**  

```
/Online-Auction-Platform-backend
│── server.js          # Main backend file
│── package.json       # Dependencies & scripts
│── package-lock.json  # Version locking
│── .env               # Environment variables (ignored in Git)
└── README.md          # Documentation
```

---

## ⚡ Installation & Setup

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/ab00s1/Online-Auction-Platform_backend.git
   cd Online-Auction-Platform-backend
   ```

2. **Install Dependencies:**
   ```sh
   npm install
   ```

3. **Start the MongoDB Server:**  
   Ensure MongoDB is running locally on `mongodb://localhost:27017/AuctionPlatform`.

4. **Run the Development Server:**
   ```sh
   npm run dev
   ```
   The backend will run on `http://localhost:5001/`.

---

## 🔑 API Endpoints

### 🟢 Authentication

| Method | Endpoint    | Description |
|--------|------------|-------------|
| `POST` | `/SignUp`  | Register a new user |
| `POST` | `/SignIn`  | Login user & generate JWT |

### 🟢 Items Management

| Method   | Endpoint         | Description |
|----------|-----------------|-------------|
| `GET`    | `/`             | Fetch all auction items |
| `POST`   | `/post-item`    | Add a new auction item |
| `GET`    | `/item/:id`     | Get item details by ID |
| `PUT`    | `/edit-item/:id` | Edit an auction item |
| `DELETE` | `/delete-item/:id` | Delete an item |

### 🟢 Bidding System

| Method | Endpoint    | Description |
|--------|------------|-------------|
| `PUT`  | `/update-bid` | Place a new bid on an item |

### 🟢 Protected Routes (Require JWT)

| Method | Endpoint          | Description |
|--------|------------------|-------------|
| `GET`  | `/protected-route` | Access a protected route |

---

## 🔒 Authentication Flow

1. **Sign Up:** User registers with `email` and `password`.
2. **Sign In:** User logs in and gets a **JWT token**.
3. **Protected Routes:** Users must include `Authorization: Bearer <token>` in headers to access secured routes.

---
