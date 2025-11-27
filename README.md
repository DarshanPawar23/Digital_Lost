# 🔗 ReConnect: AI-Powered Lost & Found Verification System

## 🌟 Overview
ReConnect is a secure, modern web application designed to help users quickly and reliably verify and reclaim lost valuable items. It utilizes advanced computer vision (MobileNet/TensorFlow.js) and document processing (Tesseract.js) technologies to establish trust between the finder and the owner before contact details are exchanged.

The system is built with a React frontend and is designed to communicate with a Node.js/Express backend (running on http://localhost:5000) for data persistence and contact retrieval.

---

## ✨ Key Features

### **Smart Search**
Search found items using keywords, category, and location.

### **Secure Multi-Factor Verification**
A mandatory three-step process for item retrieval:

1. **Police Report (FIR) Verification**  
   Uses OCR (simulated Tesseract.js in frontend) to validate key claimant information from a document image.

2. **Visual Image Match**  
   Uses a MobileNet Deep Learning Model (via TensorFlow.js) and cosine similarity to compare the claimant's lost item image against the database photo, providing a High, Medium, or Low match likelihood.

3. **Phone Verification**  
   Simulates OTP verification to ensure the claimant's phone number is legitimate and active.

### **Geolocation & Reverse Geocoding**
Fetches and converts device GPS coordinates to a human-readable address using the Nominatim API, with custom overrides for improved city accuracy (e.g., Hubli-Dharwad correction).

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### **1. Prerequisites**
Make sure the following are installed:
- Node.js (v14+)
- npm or yarn  
- A backend server running on `http://localhost:5000` (Node/Express/MySQL) with the required searchController logic.

---

### **2. Frontend Setup**

Navigate to your React project folder and install the AI-related dependencies:

```bash
npm install @tensorflow/tfjs @tensorflow-models/mobilenet
```

(Assumes React, Axios, and Tailwind are already installed.)

---

### **3. Run the Application**

Start the React development server:

```bash
npm start
```

The app will open on:
- `http://localhost:3000`  
or  
- `http://localhost:5173` (Vite)

---

## 🏛️ Project Architecture

### **Frontend**
- **Framework:** React  
- **Styling:** Tailwind CSS (dark UI, glass effects, gradient accents)  
- **Core Logic:**
  - **Image Matching:** TensorFlow.js + MobileNet model using cosine similarity  
  - **OCR Simulation:** Simplified document verification logic  
  - **Geolocation:** Browser GPS + Nominatim reverse geocoding  

### **Backend**
- **Server:** Node.js + Express  
- **Database:** MySQL (via mysql2/promise or equivalent)  
- **API Endpoints:**
  - `GET /api/search` → advanced search filtering  
  - `GET /api/contact/:item_id` → retrieves secure finder contact after verification  

---

## 🧪 Testing & Verification Details

### **Dummy Test Data Behavior (in SearchPage.js)**

| Step               | Technology                | Test Condition |
|-------------------|---------------------------|----------------|
| FIR (OCR)         | Simulated Logic (2s delay) | Upload any image → 80% success |
| Image Match (AI)  | TensorFlow.js + MobileNet  | Upload clear image → High/Medium/Low likelihood |
| Final Contact     | Frontend Validation        | Requires FIR success AND Image Match = High |

---

## 🗺️ Geolocation Correction Logic

In `PostPage.js`, the `handleGetLocation` function includes a fallback correction:

- If the browser GPS fails  
- OR inaccurate coordinates near Bangalore appear  
- THEN coordinates are overridden to:

```
Latitude: 15.3664
Longitude: 75.1235
```

This corresponds to **KLE Institute of Technology, Hubli**, and ensures accurate city tagging as **Hubli-Dharwad**.

---

