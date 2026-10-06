import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  summarizeConversation,
  getSmartReply,
  getSentimentAnalytics,
  extractTasks,
  generateMeetingMinutes,
  detectIntent,
  detectSalesOpportunities,
  getRiskScore,
  askKnowledgeBot,
  getExecutiveDashboard
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/summary", protectRoute, summarizeConversation);
router.post("/smart-reply", protectRoute, getSmartReply);
router.post("/sentiment", protectRoute, getSentimentAnalytics);
router.post("/tasks", protectRoute, extractTasks);
router.post("/minutes", protectRoute, generateMeetingMinutes);
router.post("/intent", protectRoute, detectIntent);
router.post("/sales-lead", protectRoute, detectSalesOpportunities);
router.post("/risk-score", protectRoute, getRiskScore);
router.post("/knowledge-bot", protectRoute, askKnowledgeBot);
router.get("/dashboard", protectRoute, getExecutiveDashboard);

export default router;
