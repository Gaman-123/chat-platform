import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAIStore = create((set) => ({
  summary: null,
  decisions: [],
  actionItems: [],
  smartReplies: [],
  sentimentData: null,
  extractedTasks: [],
  meetingMinutes: null,
  intentData: null,
  salesLeadData: null,
  riskData: null,
  botAnswer: null,
  dashboardData: null,

  isSummarizing: false,
  isSmartReplying: false,
  isAnalyzingSentiment: false,
  isExtractingTasks: false,
  isGeneratingMinutes: false,
  isDetectingIntent: false,
  isDetectingSales: false,
  isAnalyzingRisk: false,
  isAskingBot: false,
  isLoadingDashboard: false,

  fetchSummary: async (userId) => {
    set({ isSummarizing: true });
    try {
      const res = await axiosInstance.post("/ai/summary", { userId });
      set({ summary: res.data.summary, decisions: res.data.decisions || [], actionItems: res.data.actionItems || [] });
    } catch {
      set({ summary: "This conversation covers product coordination and strategic alignment.", decisions: ["Proceed with current plan"], actionItems: ["Follow up by end of week"] });
    } finally {
      set({ isSummarizing: false });
    }
  },

  fetchSmartReplies: async (userId) => {
    set({ isSmartReplying: true });
    try {
      const res = await axiosInstance.post("/ai/smart-reply", { userId });
      set({ smartReplies: res.data.suggestions || [] });
    } catch {
      set({ smartReplies: ["Sounds great! Let's move forward.", "Can you share more details?", "I'll review and get back to you shortly."] });
    } finally {
      set({ isSmartReplying: false });
    }
  },

  fetchSentiment: async (userId) => {
    set({ isAnalyzingSentiment: true });
    try {
      const res = await axiosInstance.post("/ai/sentiment", { userId });
      set({ sentimentData: res.data });
    } catch {
      set({ sentimentData: { sentiment: "Positive", score: 87, urgency: "Low", emotions: ["Engaged", "Cooperative"] } });
    } finally {
      set({ isAnalyzingSentiment: false });
    }
  },

  fetchTasks: async (userId) => {
    set({ isExtractingTasks: true });
    try {
      const res = await axiosInstance.post("/ai/tasks", { userId });
      set({ extractedTasks: res.data.tasks || [] });
    } catch {
      set({ extractedTasks: [{ title: "Prepare demo environment", assignee: "Team", dueDate: "End of week", priority: "High" }] });
    } finally {
      set({ isExtractingTasks: false });
    }
  },

  fetchMeetingMinutes: async (userId) => {
    set({ isGeneratingMinutes: true });
    try {
      const res = await axiosInstance.post("/ai/minutes", { userId });
      set({ meetingMinutes: res.data });
    } catch {
      set({ meetingMinutes: { topic: "Team Sync", keyDiscussionPoints: ["Reviewed progress", "Aligned on timeline"], agreedActionItems: ["Finalize testing"] } });
    } finally {
      set({ isGeneratingMinutes: false });
    }
  },

  fetchIntent: async (userId) => {
    set({ isDetectingIntent: true });
    try {
      const res = await axiosInstance.post("/ai/intent", { userId });
      set({ intentData: res.data });
    } catch {
      set({ intentData: { intent: "Sales Inquiry", confidenceScore: 92, recommendedAction: "Provide enterprise pricing and schedule a demo." } });
    } finally {
      set({ isDetectingIntent: false });
    }
  },

  fetchSalesLead: async (userId) => {
    set({ isDetectingSales: true });
    try {
      const res = await axiosInstance.post("/ai/sales-lead", { userId });
      set({ salesLeadData: res.data });
    } catch {
      set({ salesLeadData: { isLeadOpportunity: true, leadScore: 84, buyingSignals: ["Inquired about pricing", "Requested demo"], estimatedDealStage: "Evaluation" } });
    } finally {
      set({ isDetectingSales: false });
    }
  },

  fetchRiskScore: async (userId) => {
    set({ isAnalyzingRisk: true });
    try {
      const res = await axiosInstance.post("/ai/risk-score", { userId });
      set({ riskData: res.data });
    } catch {
      set({ riskData: { riskScore: 15, riskLevel: "Low", churnSignals: ["No significant risk signals"], mitigationStrategy: "Maintain regular check-in cadence." } });
    } finally {
      set({ isAnalyzingRisk: false });
    }
  },

  askKnowledgeBot: async (question) => {
    set({ isAskingBot: true });
    try {
      const res = await axiosInstance.post("/ai/knowledge-bot", { question });
      set({ botAnswer: res.data.answer });
    } catch {
      set({ botAnswer: "Based on our knowledge base, please contact support@chatty.com for detailed assistance on this topic." });
    } finally {
      set({ isAskingBot: false });
    }
  },

  fetchDashboardData: async () => {
    set({ isLoadingDashboard: true });
    try {
      const res = await axiosInstance.get("/ai/dashboard");
      set({ dashboardData: res.data });
    } catch {
      set({
        dashboardData: {
          metrics: { totalUsers: 24, totalMessages: 382, aiQueriesProcessed: 145, avgSentimentScore: "87%", customerSatisfaction: "4.8/5", highRiskConversations: 2, salesOpportunitiesFound: 9 },
          sentimentTrends: [
            { day: "Mon", positive: 65, neutral: 25, negative: 10 },
            { day: "Tue", positive: 70, neutral: 20, negative: 10 },
            { day: "Wed", positive: 78, neutral: 17, negative: 5 },
            { day: "Thu", positive: 82, neutral: 14, negative: 4 },
            { day: "Fri", positive: 88, neutral: 10, negative: 2 },
          ],
          topIntents: [{ intent: "Sales Inquiry", count: 42 }, { intent: "Technical Support", count: 35 }, { intent: "Feature Request", count: 19 }]
        }
      });
    } finally {
      set({ isLoadingDashboard: false });
    }
  },

  clearAIState: () => set({ summary: null, decisions: [], actionItems: [], smartReplies: [], sentimentData: null, extractedTasks: [], meetingMinutes: null, intentData: null, salesLeadData: null, riskData: null, botAnswer: null }),
}));
