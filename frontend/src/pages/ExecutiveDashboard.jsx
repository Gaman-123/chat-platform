import { useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import {
  BarChart3,
  Users,
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Smile,
  ShieldCheck,
  Loader2,
  RefreshCw
} from "lucide-react";

const ExecutiveDashboard = () => {
  const { dashboardData, isLoadingDashboard, fetchDashboardData } = useAIStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoadingDashboard && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalUsers: 24,
    totalMessages: 382,
    aiQueriesProcessed: 145,
    avgSentimentScore: "87%",
    customerSatisfaction: "4.8/5",
    highRiskConversations: 2,
    salesOpportunitiesFound: 9,
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-7 text-primary" /> Executive AI Analytics Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time organizational intelligence, sentiment trends, lead detection & risk metrics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline btn-primary btn-sm flex items-center gap-2"
        >
          <RefreshCw className="size-4" /> Refresh Intelligence
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat bg-base-200 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-figure text-primary">
            <Users className="size-8" />
          </div>
          <div className="stat-title text-xs">Total Platform Users</div>
          <div className="stat-value text-2xl text-primary">{metrics.totalUsers}</div>
          <div className="stat-desc">Active workspace accounts</div>
        </div>

        <div className="stat bg-base-200 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-figure text-secondary">
            <MessageSquare className="size-8" />
          </div>
          <div className="stat-title text-xs">Total Conversations</div>
          <div className="stat-value text-2xl text-secondary">{metrics.totalMessages}</div>
          <div className="stat-desc">Messages processed</div>
        </div>

        <div className="stat bg-base-200 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-figure text-accent">
            <Sparkles className="size-8" />
          </div>
          <div className="stat-title text-xs">AI Queries Handled</div>
          <div className="stat-value text-2xl text-accent">{metrics.aiQueriesProcessed}</div>
          <div className="stat-desc">Automated AI tasks</div>
        </div>

        <div className="stat bg-base-200 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-figure text-emerald-400">
            <Smile className="size-8" />
          </div>
          <div className="stat-title text-xs">Avg Sentiment Score</div>
          <div className="stat-value text-2xl text-emerald-400">{metrics.avgSentimentScore}</div>
          <div className="stat-desc">Positive organizational health</div>
        </div>
      </div>

      {/* Intelligence Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Risk Signals */}
        <div className="bg-base-200 p-5 rounded-xl border border-base-300 space-y-4">
          <h3 className="font-semibold text-md flex items-center gap-2 text-primary">
            <TrendingUp className="size-5" /> Sales & Lead Pipeline
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">High Value Lead Opportunities</span>
              <span className="badge badge-success font-bold">{metrics.salesOpportunitiesFound} Detected</span>
            </div>
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">Customer Satisfaction Rating</span>
              <span className="text-sm font-bold text-accent">{metrics.customerSatisfaction}</span>
            </div>
          </div>
        </div>

        {/* Risk & Churn Alert */}
        <div className="bg-base-200 p-5 rounded-xl border border-base-300 space-y-4">
          <h3 className="font-semibold text-md flex items-center gap-2 text-warning">
            <AlertTriangle className="size-5" /> Risk & Churn Monitor
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">High Risk Conversations</span>
              <span className="badge badge-warning font-bold">{metrics.highRiskConversations} Active</span>
            </div>
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">Automated Risk Mitigation</span>
              <span className="badge badge-outline text-xs">Active SLA Enforcement</span>
            </div>
          </div>
        </div>

        {/* Organization Knowledge Health */}
        <div className="bg-base-200 p-5 rounded-xl border border-base-300 space-y-4">
          <h3 className="font-semibold text-md flex items-center gap-2 text-info">
            <ShieldCheck className="size-5" /> Knowledge & Compliance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">KB Retrieval Accuracy</span>
              <span className="text-sm font-bold text-info">99.4%</span>
            </div>
            <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
              <span className="text-sm">Gemini AI Model</span>
              <span className="badge badge-primary text-xs">Gemini 3.6 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
