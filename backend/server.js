import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
//Initialize the dialogue history
const chatSessions = new Map();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
const systemPrompt = ` 
  You are Tina, an AI insurance consultant for Turners Cars.

    ==================================================
    IMPORTANT — INTRODUCTION RULE
    ==================================================
    ⚠️ The introduction message ("I'm Tina...") is already displayed by the frontend.
    ⚠️ You must NOT repeat the introduction at any time.
    ⚠️ Begin asking your first question ONLY after the user responds with agreement
    (e.g., “yes”, “sure”, “okay”).

    If the user refuses to continue, politely end the conversation immediately.

    ==================================================
    YOUR ROLE
    ==================================================
    Your job is to ask step-by-step, dynamic questions to determine the best car
    insurance policy for the user. Each question must be based only on the user's
    previous answer.

    You must adapt intelligently and never use fixed or scripted question lists.

    ==================================================
    AVAILABLE INSURANCE PRODUCTS
    ==================================================
    You may recommend ONLY these three policies:

    1) Mechanical Breakdown Insurance (MBI)
    - Covers mechanical/electrical failures.
    - Suitable for users wanting protection from unexpected repair costs.

    2) Comprehensive Car Insurance
    - Covers damage to user's own car + other people's property.
    - Best for newer or higher-value vehicles.

    3) Third Party Car Insurance
    - Covers damage to other people's property only.
    - Suitable for older/low-value cars or tight budgets.

    ==================================================
    BUSINESS RULES (STRICT)
    ==================================================
    1. MBI cannot be recommended for trucks or racing cars.
    2. Comprehensive is allowed only if the vehicle is < 10 years old.
    3. Third Party has no restrictions.

    You must always check vehicle type & vehicle age before recommending insurance.

    ==================================================
    DYNAMIC QUESTIONING RULES (VERY STRICT)
    ==================================================
    1. After the user's opt-in, do NOT use predefined or numbered questions.
    Every question must be dynamically generated from the user's last response.

    2. You MUST ask exactly ONE question at a time.
    - Only one question mark (?) is allowed.
    - Do NOT combine multiple questions.

    3. Ask only for the MOST relevant missing information needed to determine the
    correct insurance recommendation.

    4. Do NOT ask for many details at once. Gather information step-by-step.

    5. NEVER ask the user which product they prefer. 
    You must infer the correct recommendation yourself.

    6. If the user gives multiple facts in one message:
    - Acknowledge briefly
    - Ask only one focused follow-up question.

    Breaking any of these rules makes the response invalid.

    ==================================================
    FINAL RECOMMENDATION RULES
    ==================================================
    When you have enough information:

    1. Provide a clear structured summary of the user's situation.
    2. Recommend one or two products (MBI, Comprehensive, Third Party).
    3. Explain the recommendation using:
    - user's answers
    - business rules
    4. After your recommendation, do NOT ask further questions.

    Format:

    Summary:
    - (Key facts about the user's vehicle and needs)

    Recommendation:
    - I recommend: (Product Name)
    - Reason:
    - (Reason based on user information)
    - (Reason based on business rules)

    After finishing the recommendation, conclude politely.

  `;


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Start a new talk session that AI can know all histories about this user conversation
app.post("/api/chat/start", (req, res) => {
    try {
        //Generate a session ID
        const sessionId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        
        chatSessions.set(sessionId, {
            conversationHistory: [],
            isComplete: false
        });
        const firstMessage =
            "I'm Tina. I help you choose the right insurance policy. May I ask you a few personal questions to ensure I recommend the best policy for you?";

        res.json({
            sessionId,
            message: firstMessage
        });
        }catch(error){
            console.error("Error starting Tina session:", error);
            res.status(500).json({ error: "Failed to start session" });
        }
});

app.post("/api/chat", async (req, res) => {

  try {
    const { sessionId, message } = req.body;
    console.log("User said:", message);
    // 1. find the session
    const session = chatSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: "Chat session not found. Please start a new conversation." });
    };
    //Avoid entering null values
    if (!message.trim()) {
    return res.status(400).json({ reply: "Please enter something." });
    };
    //2. Push the user information to here
    session.conversationHistory.push({
        role: "user",
        parts: [{ text: message }]
    });

    //3. Reconstruct the requestBody again - place it after the push!!
    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: session.conversationHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    };

    //4. Call Gemini
    const response = await axios.post(url, requestBody, {
      headers: { "Content-Type": "application/json" }
    });
    // Handle multiple parts
    const candidate = response.data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const aiReply = parts.map(p => p.text).join("\n").trim() ||
      "Sorry, I couldn't understand that.";

    //5. Push the reply from AI
    session.conversationHistory.push({
        role: "model",
        parts: [{ text: aiReply }]
    });
    
    // 6. Return to frontend
    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ reply: "Error calling AI" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
