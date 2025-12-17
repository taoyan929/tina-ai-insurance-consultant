# 🚗 Tina – AI Insurance Recommendation Assistant

Tina is an AI-powered insurance consultant that chats with users and helps them choose the most suitable car insurance policy.  
It provides a natural step-by-step conversation, asks one question at a time, follows Turners’ business rules, and delivers a structured final recommendation.

---

## ✨ Features

- User chats with **Tina**, an AI insurance consultant  
- Tina adapts her next question based on the user's latest answer  
- **One-question-at-a-time** (strict enforcement)  
- Business rules ensure **valid and accurate** insurance recommendations  
- Session-based conversation memory  
- Final recommendation includes **structured summary + reasons**  
- Modern chat UI with:
  - Chat bubbles  
  - Auto-scroll  
  - Typing indicator  
  - Enter-to-send  
- Node.js backend integrated with **Google Gemini 2.5 Flash**  
- Full error handling on both frontend and backend  

---

## 🧰 Tech Stack

### Frontend
- React + Vite  
- Custom CSS for chat UI  
- Auto-scroll, typing animation, enter-to-send behavior  

### Backend
- Node.js  
- Express  
- REST API routes  
- Session management using `Map()`  

### AI
- Google **Gemini 2.5 Flash**  
- System Prompt engineering  
- Dynamic questioning logic  
- Business-rule-based recommendation logic  

### Tools
- Postman  
- Git & GitHub  

---

## 🏗️ System Architecture

 Frontend (React + Vite)
├─ Renders chat UI
├─ Sends user messages to backend
├─ Displays Tina responses
└─ Manages sessionId, typing animation, auto-scroll

Backend (Node.js + Express)
├─ /api/chat/start → create new session
├─ /api/chat → send message to AI
├─ Stores conversation history in Map
└─ Applies business rules + system prompt

AI Layer (Gemini 2.5 Flash)
├─ Reads system prompt
├─ Enforces one-question-at-a-time rule
├─ Uses conversation history
└─ Generates final insurance recommendation


---

## 🧠 AI Prompt Design Highlights

- **Strict non-repetition rule**  
  Tina never repeats her introduction; the frontend handles the greeting.

- **Dynamic Questioning**  
  Each question is generated based on the user's latest answer instead of a fixed list.

- **One-question rule**  
  The AI is forced to use only **one question mark (?)** per message.

- **Business Rule Enforcement**  
  - MBI: Not allowed for trucks or racing cars  
  - Comprehensive: Must be under 10 years old  
  - Third Party: No restrictions  

- **Structured Final Output**
  - Summary  
  - Recommendation  
  - Reasons  

- **Session Memory**
  - All previous messages stored in `Map()`
  - Full history is sent to Gemini each time for context  

---
