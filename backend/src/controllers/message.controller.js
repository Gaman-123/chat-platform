import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import redis from "../lib/redis.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API helper - AQ. keys work as query params, no Bearer needed
// .trim() is critical to remove Windows CRLF line endings from .env file
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`;

async function callGemini(prompt, conversationHistory = []) {
  const isImageRequest = /(generate|create|draw|make|show|render)\s+.*(image|photo|picture|drawing|illustration|art)/i.test(prompt);

  if (isImageRequest) {
    const cleanPrompt = prompt
      .replace(/@gemini/gi, "")
      .replace(/(generate|create|draw|make|show|render)\s+(an?\s+)?(image|photo|picture|drawing|illustration|art)\s+(of\s+)?/gi, "")
      .trim();

    const tag = cleanPrompt.replace(/\s+/g, ',') || "city,cyberpunk";
    // Fast, reliable image generator CDN (picsum + loremflickr)
    const seed = Math.floor(Math.random() * 1000);
    const imageUrl = `https://loremflickr.com/800/500/${encodeURIComponent(tag)}?random=${seed}`;

    return {
      text: `🎨 **Generated Image for:** "${cleanPrompt || prompt}"`,
      image: imageUrl,
    };
  }

  // Prepended system directive and recent conversation context
  const systemDirective = "You are Gemini AI assistant in a chat app. Keep your answer concise, clear, and compact (2-4 sentences or short bullets). Avoid long intros.\n\n";

  let formattedHistory = "";
  if (conversationHistory.length > 0) {
    formattedHistory = "Recent conversation context:\n" +
      conversationHistory.slice(-5).map(m => `${m.senderId}: ${m.text || ''}${m.geminiResponse ? ' [Gemini: ' + m.geminiResponse + ']' : ''}`).join("\n") + "\n\n";
  }

  const fullPrompt = systemDirective + formattedHistory + "User request: " + prompt;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  return { text: textResponse, image: null };
}

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const cacheKey = `sidebar_users:${loggedInUserId}`;

    // Check cache first
    const cachedUsers = await redis.get(cacheKey);
    if (cachedUsers) {
      return res.status(200).json(JSON.parse(cachedUsers));
    }

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Store in cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(filteredUsers), "EX", 300);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Sort IDs to create a consistent cache key for the conversation
    const conversationId = [myId.toString(), userToChatId.toString()].sort().join("_");
    const cacheKey = `messages:${conversationId}`;

    // Check cache first
    const cachedMessages = await redis.get(cacheKey);
    if (cachedMessages) {
      return res.status(200).json(JSON.parse(cachedMessages));
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Cache messages for 1 hour
    await redis.set(cacheKey, JSON.stringify(messages), "EX", 3600);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      geminiResponse: null,
    });

    await newMessage.save();

    // Invalidate message cache for this conversation
    const conversationId = [senderId.toString(), receiverId.toString()].sort().join("_");
    await redis.del(`messages:${conversationId}`);

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    // Broadcast user's message immediately to both receiver & sender
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Return response immediately so UI feels instant
    res.status(201).json(newMessage);

    // If @gemini is mentioned, process AI response asynchronously in background
    if (text && text.toLowerCase().includes("@gemini")) {
      (async () => {
        try {
          const prompt = text.replace(/@gemini/gi, "").trim();
          console.log("Processing Gemini request in background for prompt:", prompt);

          // Fetch last 5 messages in conversation for AI context
          const recentMessages = await Message.find({
            $or: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          }).sort({ createdAt: -1 }).limit(5);

          const result = await callGemini(prompt, recentMessages.reverse());

          // Update saved message with Gemini text and image
          newMessage.geminiResponse = result.text;
          newMessage.geminiImage = result.image;
          await newMessage.save();

          // Invalidate cache again so fetch gets latest data
          await redis.del(`messages:${conversationId}`);

          // Emit event to update the message in real-time on frontends
          const updatePayload = {
            messageId: newMessage._id,
            geminiResponse: result.text,
            geminiImage: result.image
          };
          if (receiverSocketId) io.to(receiverSocketId).emit("updateMessageGemini", updatePayload);
          if (senderSocketId) io.to(senderSocketId).emit("updateMessageGemini", updatePayload);
        } catch (aiError) {
          console.error("Async Gemini processing error:", aiError.message);
          newMessage.geminiResponse = "Sorry, I could not process your request right now. Please try again.";
          await newMessage.save();
          const updatePayload = { messageId: newMessage._id, geminiResponse: newMessage.geminiResponse, geminiImage: null };
          if (receiverSocketId) io.to(receiverSocketId).emit("updateMessageGemini", updatePayload);
          if (senderSocketId) io.to(senderSocketId).emit("updateMessageGemini", updatePayload);
        }
      })();
    }
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
