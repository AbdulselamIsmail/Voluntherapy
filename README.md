# 💜 VolunTherapy: Telehealth Appointment System

**A voluntary counseling platform connecting certified therapists with users for free online sessions.**

This project is a modern, full-stack teletherapy application built with the MERN stack. It features secure JWT authentication, role-based dashboards, and external API integration for video conferencing.

---

## ✨ Features

* **Role-Based Authentication:** Separate login/dashboard views for **Clients (Patients)** and **Doctors (Therapists)**.
* **Secure Booking System:** Clients can view available slots and book appointments, updating the MongoDB database securely.
* **Absolute URL Deployment Fix:** Uses environment variables (`VITE_API_URL`) to ensure seamless communication between the deployed frontend and backend services.
* **Video Conference Integration:** Appointments include dynamic links for external video meetings (e.g., Jitsi, Zoom, Google Meet).
* **Responsive UI:** Built with React and modern component libraries (Shadcn UI).

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** + TypeScript | Fast client-side rendering and module bundling. |
| **Styling/UI** | **Tailwind CSS** + Shadcn UI | Utility-first CSS framework and modern components. |
| **Backend** | **Node.js** + **Express** | RESTful API server for handling business logic. |
| **Database** | **MongoDB** (via Mongoose) | Flexible NoSQL database for storing user data and appointments. |
| **Auth** | **JWT** (JSON Web Tokens) + **Bcrypt** | Secure session management and password hashing. |

---

## 🚀 Getting Started Locally

Follow these steps to set up the project on your local machine.

### 1. Prerequisites

You must have the following installed:
* Node.js (LTS version)
* MongoDB Atlas Account (Free Tier is sufficient)
* Git

### 2. Backend Setup (`/server`)

Navigate to the `server` directory and set up your environment variables.

1.  **Install Dependencies:**
    ```bash
    cd server
    npm install
    ```
2.  **Create `.env` File:** Create a file named **`.env`** in the `/server` folder with your credentials.
    ```env
    # --- MongoDB Connection ---
    MONGO_URI="mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/?appName=voluntherapy"
    
    # --- Security Keys ---
    JWT_SECRET="your_32_character_random_secret_string"
    
    # --- Server Port ---
    PORT=5000 
    ```
3.  **Run the Server:**
    ```bash
    npm start
    # Server running on port 5000
    ```

### 3. Frontend Setup (`/client`)

Navigate to the `client` directory and prepare the React app.

1.  **Install Dependencies:**
    ```bash
    cd ../client
    npm install
    ```
2.  **Set Local API URL:** Create a file named **`.env`** in the `/client` folder for local development proxy settings.
    ```env
    # VITE prefix is required for client-side variables
    VITE_API_URL="http://localhost:5000" 
    ```
3.  **Run the Frontend:**
    ```bash
    npm run dev
    # Server running on http://localhost:8080 (or similar)
    ```

---

## 🌐 Deployment Details (Production)

The production application is set up using a **Two-Service Architecture** on Render, which avoids the complexities of monorepo deployment and ensures secure, separate scaling for the API and the Static Site.

### Service 1: Backend API (Render Web Service)

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Root Directory** | `server` | Ensures Node runs commands inside the API folder. |
| **Build Command** | `npm install` | |
| **Start Command** | `node server.js` | |
| **Env Vars** | `MONGO_URI`, `JWT_SECRET` | Must match `.env` values exactly. |
| **CORS** | Configured for `*` origin | Allows the Frontend to connect. |

### Service 2: Frontend Client (Render Static Site)

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Root Directory** | `client` | Ensures React build runs in the correct folder. |
| **Build Command** | `npm install && npm run build` | |
| **Publish Directory** | `dist` | Vite's default build output folder. |
| **Env Vars** | `VITE_API_URL` | Must be set to the **LIVE URL** of the Backend Web Service (e.g., `https://voluntherapy-api.onrender.com`). |
| **Rewrites** | `Source: /*`, `Destination: /index.html` | **Crucial** for React Router to handle page refreshing. |

---

## 🔒 Security Notes

* **Authentication:** The system relies on **JSON Web Tokens (JWT)** stored in the client's `localStorage` and verified by the `authMiddleware` in the backend using the secret key.
* **Secrets:** The `JWT_SECRET` and `MONGO_URI` are stored securely as **Environment Variables** on the Render dashboard and are never committed to the GitHub repository.

---
This project is created for educational and voluntary purposes. Unauthorized copying, distribution, or commercial use is prohibited without explicit permission from the original authors.
