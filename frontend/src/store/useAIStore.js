import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

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
      set({
        summary: res.data.summary,
        decisions: res.data.decisions || [],
        actionItems: res.data.actionItems || [],
      });
    } catch {
      toast.error("Failed to generate summary");
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
      set({ smartReplies: ["Sounds good!", "Let's keep in touch.", "Can you elaborate?"] });
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
      toast.error("Failed to analyze sentiment");
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
      toast.error("Failed to extract tasks");
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
      toast.error("Failed to generate minutes");
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
      toast.error("Failed to detect intent");
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
      toast.error("Failed to analyze sales opportunity");
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
      toast.error("Failed to analyze risk score");
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
      toast.error("Knowledge Bot failed to respond");
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
      toast.error("Failed to load Executive Dashboard");
    } finally {
      set({ isLoadingDashboard: false });
    }
  },

  clearAIState: () => {
    set({
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
    });
  }
}));
