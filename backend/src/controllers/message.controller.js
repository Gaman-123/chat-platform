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

async function callGemini(prompt) {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
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

    // Check if message contains @gemini mention
    let geminiResponse = null;
    if (text && text.toLowerCase().includes("@gemini")) {
      try {
        // Extract the prompt by removing @gemini from the text
        const prompt = text.replace(/@gemini/gi, "").trim();
        geminiResponse = await callGemini(prompt);
        console.log("Gemini responded to:", prompt);
      } catch (aiError) {
        console.error("Gemini API error:", aiError.message);
        geminiResponse = "Sorry, I could not process your request right now. Please try again.";
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      geminiResponse,
    });

    await newMessage.save();

    // Invalidate message cache for this conversation
    const conversationId = [senderId.toString(), receiverId.toString()].sort().join("_");
    await redis.del(`messages:${conversationId}`);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
