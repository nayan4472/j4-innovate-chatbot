# 🤖 J4_Innovate Chatbot

An AI-powered chatbot for lead generation, multilingual conversations, and meeting scheduling with an admin dashboard.  
Built with a focus on automation, user engagement, and business growth.

---

## 🚀 Features

### 💬 Smart AI Chatbot
- Supports English, Hindi, and Gujarati  
- Answers general questions using Google Gemini API  
- Natural and intelligent conversation flow  

---

### 📈 Lead Generation System
- Service selection (1, 2, 3 options)  
- Step-by-step user guidance  
- Collects:  
  - Full Name  
  - Business Name  
  - WhatsApp Number / Email  
- Shows final summary  
- Automatically stores data  

---

### 📅 Meeting Scheduler
- Users can book meetings directly  
- Select day (Monday to Friday)  
- Choose preferred time  
- Enter contact details  

---

### 🔐 Admin Panel (Hidden)
- Access URL: `/admin`  
  Example: `http://localhost:5173/admin`  

- **Password:** `123456`  

#### Admin Features:
- View all leads in table format  
- See timestamp of each entry  
- Manage data easily  
- Clear all data option  

---

## 🧠 System Logic

- **Storage:** Uses browser `localStorage` (data persists after refresh)  
- **API:** Google Gemini AI for real-time responses  
- **Flow:** Fully automated user interaction & data collection  

---

## 🛠️ Tech Stack

- React + Vite  
- JavaScript  
- Google Gemini API  
- LocalStorage  

---

## 📌 How to Run

```bash
npm install
npm run dev
