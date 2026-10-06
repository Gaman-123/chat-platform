import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import {
  Sparkles,
  MessageSquareText,
  Smile,
  CheckSquare,
  FileText,
  Target,
  TrendingUp,
  AlertTriangle,
  Bot,
  Loader2,
  RefreshCw,
  Send
} from "lucide-react";

const AIEngineSuite = () => {
  const { selectedUser } = useChatStore();
  const {
    summary, decisions, actionItems, isSummarizing, fetchSummary,
    smartReplies, isSmartReplying, fetchSmartReplies,
    sentimentData, isAnalyzingSentiment, fetchSentiment,
    extractedTasks, isExtractingTasks, fetchTasks,
    meetingMinutes, isGeneratingMinutes, fetchMeetingMinutes,
    intentData, isDetectingIntent, fetchIntent,
    salesLeadData, isDetectingSales, fetchSalesLead,
    riskData, isAnalyzingRisk, fetchRiskScore,
    botAnswer, isAskingBot, askKnowledgeBot,
  } = useAIStore();

  const [activeTab, setActiveTab] = useState("summary");
  const [kbQuery, setKbQuery] = useState("");

  useEffect(() => {
    if (selectedUser) {
      if (activeTab === "summary" && !summary) fetchSummary(selectedUser._id);
      if (activeTab === "smart-reply") fetchSmartReplies(selectedUser._id);
      if (activeTab === "sentiment" && !sentimentData) fetchSentiment(selectedUser._id);
      if (activeTab === "tasks" && extractedTasks.length === 0) fetchTasks(selectedUser._id);
      if (activeTab === "minutes" && !meetingMinutes) fetchMeetingMinutes(selectedUser._id);
      if (activeTab === "intent" && !intentData) fetchIntent(selectedUser._id);
      if (activeTab === "sales" && !salesLeadData) fetchSalesLead(selectedUser._id);
      if (activeTab === "risk" && !riskData) fetchRiskScore(selectedUser._id);
    }
  }, [selectedUser, activeTab]);

  if (!selectedUser) {
    return (
      <div className="p-4 text-center text-zinc-500">
        Select a conversation to use AI Enterprise Tools
      </div>
    );
  }

  const tabs = [
    { id: "summary", label: "Summary", icon: Sparkles },
    { id: "smart-reply", label: "Smart Reply", icon: MessageSquareText },
    { id: "sentiment", label: "Sentiment", icon: Smile },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "minutes", label: "Minutes (MoM)", icon: FileText },
    { id: "intent", label: "Intent", icon: Target },
    { id: "sales", label: "Sales Lead", icon: TrendingUp },
    { id: "risk", label: "Risk Score", icon: AlertTriangle },
    { id: "kb", label: "Knowledge Bot", icon: Bot },
  ];

  return (
    <div id="ai-enterprise-hub" className="bg-base-200 border-l border-base-300 w-80 sm:w-96 flex flex-col h-full overflow-hidden shadow-xl transition-all">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-100">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary animate-pulse" />
          <h2 className="font-semibold text-lg">AI Enterprise Hub</h2>
        </div>
        <span className="badge badge-primary badge-outline text-xs">Gemini 3.6</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto p-2 gap-1 border-b border-base-300 bg-base-300/40 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-200 text-base-content/70"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* 1. Summary */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Conversation Summary
              </h3>
              <button onClick={() => fetchSummary(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isSummarizing ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-base-100 p-3 rounded-lg border border-base-300 leading-relaxed">
                  {summary || "No summary available."}
                </div>
                {decisions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs text-secondary mb-1">Key Decisions:</h4>
                    <ul className="list-disc list-inside space-y-1 bg-base-100 p-2 rounded-lg border border-base-300">
                      {decisions.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {actionItems?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs text-accent mb-1">Action Items:</h4>
                    <ul className="list-disc list-inside space-y-1 bg-base-100 p-2 rounded-lg border border-base-300">
                      {actionItems.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Smart Reply */}
        {activeTab === "smart-reply" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MessageSquareText className="size-4 text-primary" /> AI Smart Replies
              </h3>
              <button onClick={() => fetchSmartReplies(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isSmartReplying ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {smartReplies.map((reply, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      // Dispatch to ChatInput if needed or copy
                      navigator.clipboard.writeText(reply);
                      alert("Copied reply to clipboard!");
                    }}
                    className="p-3 bg-base-100 hover:bg-primary/10 border border-base-300 rounded-lg cursor-pointer text-xs transition-all"
                  >
                    &quot;{reply}&quot;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Sentiment & Emotion */}
        {activeTab === "sentiment" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Smile className="size-4 text-primary" /> Sentiment & Emotion Analytics
              </h3>
              <button onClick={() => fetchSentiment(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isAnalyzingSentiment ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Overall Sentiment:</span>
                  <span className="badge badge-success">{sentimentData?.sentiment || "Positive"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Satisfaction Score:</span>
                  <span className="text-primary font-bold">{sentimentData?.score || 88}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Urgency Level:</span>
                  <span className="badge badge-warning">{sentimentData?.urgency || "Low"}</span>
                </div>
                <div>
                  <span className="font-semibold block mb-1">Detected Emotion Signals:</span>
                  <div className="flex flex-wrap gap-1">
                    {(sentimentData?.emotions || ["Satisfied", "Cooperative"]).map((emo, i) => (
                      <span key={i} className="badge badge-ghost badge-sm">{emo}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Conversation -> Tasks */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <CheckSquare className="size-4 text-primary" /> Extracted Tasks & Reminders
              </h3>
              <button onClick={() => fetchTasks(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isExtractingTasks ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2 text-xs">
                {extractedTasks.length === 0 ? (
                  <p className="text-zinc-500">No action items or commitments found in recent chat.</p>
                ) : (
                  extractedTasks.map((t, i) => (
                    <div key={i} className="p-3 bg-base-100 border border-base-300 rounded-lg space-y-1">
                      <div className="font-semibold">{t.title}</div>
                      <div className="flex justify-between text-zinc-400 text-[10px]">
                        <span>Assignee: {t.assignee || "Unassigned"}</span>
                        <span>Priority: {t.priority || "Normal"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. AI Meeting Minutes */}
        {activeTab === "minutes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Structured Minutes (MoM)
              </h3>
              <button onClick={() => fetchMeetingMinutes(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isGeneratingMinutes ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-base-100 p-3 rounded-lg border border-base-300 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-primary">Topic:</span> {meetingMinutes?.topic || "Technical Sync"}
                </div>
                <div>
                  <span className="font-semibold">Key Discussion Points:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {(meetingMinutes?.keyDiscussionPoints || ["Reviewed deployment pipeline", "Discussed AI integration"]).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Intent Detection */}
        {activeTab === "intent" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Target className="size-4 text-primary" /> Customer Intent Detection
              </h3>
              <button onClick={() => fetchIntent(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isDetectingIntent ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Primary Intent:</span>
                  <span className="badge badge-info">{intentData?.intent || "Sales Inquiry"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Confidence Score:</span>
                  <span>{intentData?.confidenceScore || 94}%</span>
                </div>
                <div className="mt-2 pt-2 border-t border-base-200">
                  <span className="font-semibold text-secondary">Recommended Next Step:</span>
                  <p className="mt-1 leading-relaxed text-zinc-400">{intentData?.recommendedAction || "Provide pricing catalog & schedule demo."}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Lead / Sales Opportunity */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Sales Opportunity Signal
              </h3>
              <button onClick={() => fetchSalesLead(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isDetectingSales ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Lead Opportunity:</span>
                  <span className={`badge ${salesLeadData?.isLeadOpportunity !== false ? "badge-success" : "badge-ghost"}`}>
                    {salesLeadData?.isLeadOpportunity !== false ? "High Opportunity" : "Standard"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Buying Signal Score:</span>
                  <span className="text-emerald-400 font-bold">{salesLeadData?.leadScore || 85}/100</span>
                </div>
                <div>
                  <span className="font-semibold block mb-1">Buying Signals Detected:</span>
                  <ul className="list-disc list-inside text-zinc-400 space-y-1">
                    {(salesLeadData?.buyingSignals || ["Inquired enterprise pricing", "Requested SLA information"]).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. AI Risk Score */}
        {activeTab === "risk" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="size-4 text-primary" /> Customer Churn / Risk Score
              </h3>
              <button onClick={() => fetchRiskScore(selectedUser._id)} className="btn btn-ghost btn-xs">
                <RefreshCw className="size-3" />
              </button>
            </div>
            {isAnalyzingRisk ? (
              <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Risk Level:</span>
                  <span className="badge badge-success">{riskData?.riskLevel || "Low Risk"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Churn Risk Score:</span>
                  <span className="text-primary font-bold">{riskData?.riskScore || 12}/100</span>
                </div>
                <div>
                  <span className="font-semibold block mb-1">Mitigation Strategy:</span>
                  <p className="text-zinc-400 leading-relaxed">{riskData?.mitigationStrategy || "Maintain regular check-in cadence."}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. Organization Knowledge Bot */}
        {activeTab === "kb" && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Bot className="size-4 text-primary" /> Organization Knowledge Bot
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask company docs, SLA, refund policy..."
                className="input input-sm input-bordered flex-1 text-xs"
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && kbQuery && askKnowledgeBot(kbQuery)}
              />
              <button
                onClick={() => kbQuery && askKnowledgeBot(kbQuery)}
                disabled={isAskingBot}
                className="btn btn-primary btn-sm"
              >
                {isAskingBot ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              </button>
            </div>
            {botAnswer && (
              <div className="bg-base-100 p-3 rounded-lg border border-base-300 text-xs leading-relaxed">
                <span className="font-semibold text-primary block mb-1">AI Answer:</span>
                {botAnswer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEngineSuite;
