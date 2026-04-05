"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Calendar, AlertTriangle, CheckCircle, Clock, ChevronRight, ArrowUp, ArrowDown, Zap, Target, TrendingUp, Package, Users } from "lucide-react";

interface Actionable {
  priority: string;
  task: string;
  reason: string;
  expected_impact: string;
  deadline: string;
}

interface Risk {
  risk: string;
  likelihood: string;
  mitigation: string;
}

interface Opportunity {
  opportunity: string;
  potential: string;
  action: string;
}

interface DailyInsight {
  date: string;
  yesterday_summary: string;
  today_predictions: { expected_revenue: string; expected_orders: string; confidence: string };
  actionables: Actionable[];
  risks: Risk[];
  opportunities: Opportunity[];
}

interface WeeklyInsight {
  week_start: string;
  week_end: string;
  weekly_summary: string;
  next_week_predictions: { revenue_estimate: string; growth_projection: string; peak_days: string[]; confidence: string };
  actionables: any[];
  inventory_actions: any[];
  risks: Risk[];
  opportunities: Opportunity[];
}

interface MonthlyInsight {
  month: string;
  period: string;
  monthly_summary: string;
  growth_strategy: { revenue_target: string; growth_rate: string; key_levers: string[] };
  actionables: any[];
  inventory_strategy: any[];
  marketing_recommendations: any[];
  risks: Risk[];
  opportunities: Opportunity[];
}

export default function AIInsightsTab() {
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<DailyInsight | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyInsight | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyInsight | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [actions, setActions] = useState<any[]>([]);

  const fetchData = async (type: string, force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights/${type}${force ? '?force=true' : ''}`);
      if (res.ok) {
        const json = await res.json();
        if (type === 'daily') {
          setDailyData(json.data);
        } else if (type === 'weekly') {
          setWeeklyData(json.data);
        } else {
          setMonthlyData(json.data);
        }
        setGeneratedAt(json.generatedAt);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} insights:`, err);
    }
    setLoading(false);
  };

  const fetchActions = async () => {
    try {
      const res = await fetch('/api/actions/list?status=pending');
      if (res.ok) {
        const json = await res.json();
        setActions(json.actions || []);
      }
    } catch (err) {
      console.error('Failed to fetch actions:', err);
    }
  };

  useEffect(() => {
    fetchData(activePeriod);
    fetchActions();
  }, [activePeriod]);

  const handleGenerate = (type: string) => {
    fetchData(type, true);
  };

  const completeAction = async (actionId: string, status: string) => {
    try {
      await fetch('/api/actions/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, status }),
      });
      fetchActions();
    } catch (err) {
      console.error('Failed to update action:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const renderDaily = () => {
    if (!dailyData) return <div className="text-white/40">No daily insights available</div>;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Yesterday's Performance</h3>
          <p className="text-white/60">{dailyData.yesterday_summary}</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Expected Revenue</div>
              <div className="text-xl font-bold text-white">{dailyData.today_predictions?.expected_revenue || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Expected Orders</div>
              <div className="text-xl font-bold text-white">{dailyData.today_predictions?.expected_orders || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Confidence</div>
              <div className={`text-xl font-bold ${dailyData.today_predictions?.confidence === 'high' ? 'text-green-400' : 'text-yellow-400'}`}>
                {dailyData.today_predictions?.confidence || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Actionables */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-[#cfa15f]" />
            Today's Actionables
          </h3>
          <div className="space-y-3">
            {dailyData.actionables?.map((action, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getPriorityColor(action.priority)}`}>
                  {action.priority}
                </span>
                <div className="flex-1">
                  <div className="text-white font-medium">{action.task}</div>
                  <div className="text-white/40 text-sm mt-1">{action.reason}</div>
                  <div className="text-[#cfa15f] text-sm mt-2">Impact: {action.expected_impact}</div>
                </div>
                <span className="text-white/40 text-sm">{action.deadline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              Risks
            </h3>
            <div className="space-y-3">
              {dailyData.risks?.map((risk, idx) => (
                <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-white font-medium">{risk.risk}</div>
                  <div className="text-white/40 text-sm mt-1">Mitigation: {risk.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Opportunities
            </h3>
            <div className="space-y-3">
              {dailyData.opportunities?.map((opp, idx) => (
                <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-white font-medium">{opp.opportunity}</div>
                  <div className="text-white/40 text-sm mt-1">Potential: {opp.potential}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekly = () => {
    if (!weeklyData) return <div className="text-white/40">No weekly insights available</div>;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">This Week's Performance</h3>
          <p className="text-white/60">{weeklyData.weekly_summary}</p>
          <div className="mt-4 flex gap-4 flex-wrap">
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Revenue Estimate</div>
              <div className="text-xl font-bold text-white">{weeklyData.next_week_predictions?.revenue_estimate || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Growth Projection</div>
              <div className="text-xl font-bold text-green-400">{weeklyData.next_week_predictions?.growth_projection || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Peak Days</div>
              <div className="text-white">{weeklyData.next_week_predictions?.peak_days?.join(', ') || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Actionables */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#cfa15f]" />
            This Week's Plan
          </h3>
          <div className="space-y-3">
            {weeklyData.actionables?.map((action, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getPriorityColor(action.priority)}`}>
                  {action.priority}
                </span>
                <div className="flex-1">
                  <div className="text-white font-medium">{action.task}</div>
                  <div className="text-white/40 text-sm mt-1">{action.reason}</div>
                  <div className="text-[#cfa15f] text-sm mt-2">Timeline: {action.timeline} | Impact: {action.expected_impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Actions */}
        {weeklyData.inventory_actions?.length > 0 && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-yellow-400" />
              Inventory Actions
            </h3>
            <div className="space-y-3">
              {weeklyData.inventory_actions.map((inv: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                  <div>
                    <div className="text-white font-medium">{inv.product}</div>
                    <div className="text-white/40 text-sm">{inv.action} - {inv.quantity}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    inv.urgency === 'immediate' ? 'bg-red-500/20 text-red-400' : 
                    inv.urgency === 'this week' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {inv.urgency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthly = () => {
    if (!monthlyData) return <div className="text-white/40">No monthly insights available</div>;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Monthly Performance</h3>
          <p className="text-white/60">{monthlyData.monthly_summary}</p>
          <div className="mt-4 flex gap-4 flex-wrap">
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Revenue Target</div>
              <div className="text-xl font-bold text-white">{monthlyData.growth_strategy?.revenue_target || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Growth Rate</div>
              <div className="text-xl font-bold text-green-400">{monthlyData.growth_strategy?.growth_rate || 'N/A'}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wider">Key Levers</div>
              <div className="text-white text-sm">{monthlyData.growth_strategy?.key_levers?.join(', ') || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Actionables by Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => {
            const weekActions = monthlyData.actionables?.filter((a: any) => a.timeline === week) || [];
            return (
              <div key={week} className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <h4 className="font-semibold text-white mb-3">{week}</h4>
                <div className="space-y-2">
                  {weekActions.length > 0 ? weekActions.map((action: any, idx: number) => (
                    <div key={idx} className="p-2 bg-[#1a1a1a] rounded-lg">
                      <div className="text-white text-sm">{action.task}</div>
                      <div className="text-[#cfa15f] text-xs mt-1">{action.category}</div>
                    </div>
                  )) : <div className="text-white/40 text-sm">No major tasks</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Marketing Recommendations */}
        {monthlyData.marketing_recommendations?.length > 0 && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-[#cfa15f]" />
              Marketing Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyData.marketing_recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                  <div className="text-white font-semibold">{rec.channel}</div>
                  <div className="text-[#cfa15f] text-sm mt-1">Budget: {rec.budget_allocation}</div>
                  <div className="text-white/60 text-sm mt-2">{rec.strategy}</div>
                  <div className="text-green-400 text-sm mt-2">Expected ROI: {rec.expected_roi}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles size={28} className="text-[#cfa15f]" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI-Powered Business Insights</h2>
            <p className="text-white/40 text-sm">Data-driven recommendations for growth</p>
          </div>
        </div>
        <button
          onClick={() => handleGenerate(activePeriod)}
          disabled={loading}
          className="flex items-center gap-2 bg-[#cfa15f] text-black px-4 py-2 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Regenerate"}
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { id: 'daily', label: 'Daily', icon: Clock, desc: 'Next 24 hours' },
          { id: 'weekly', label: 'Weekly', icon: Calendar, desc: 'Next 7 days' },
          { id: 'monthly', label: 'Monthly', icon: TrendingUp, desc: 'Next 30 days' },
        ].map((period) => (
          <button
            key={period.id}
            onClick={() => setActivePeriod(period.id as any)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              activePeriod === period.id
                ? "bg-[#cfa15f] text-black border-[#cfa15f]"
                : "bg-[#111] text-white/60 border-white/10 hover:border-[#cfa15f]/30"
            }`}
          >
            <period.icon size={18} />
            <div className="text-left">
              <div className="font-semibold">{period.label}</div>
              <div className="text-xs opacity-60">{period.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Generated Time */}
      {generatedAt && (
        <div className="text-white/40 text-sm">
          Last generated: {new Date(generatedAt).toLocaleString()}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-12 text-center">
          <RefreshCw size={48} className="text-[#cfa15f] animate-spin mx-auto mb-4" />
          <div className="text-white/60">Generating AI insights...</div>
        </div>
      ) : (
        <>
          {activePeriod === 'daily' && renderDaily()}
          {activePeriod === 'weekly' && renderWeekly()}
          {activePeriod === 'monthly' && renderMonthly()}
        </>
      )}

      {/* Pending Actions */}
      {actions.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            Pending Actions ({actions.length})
          </h3>
          <div className="space-y-2">
            {actions.slice(0, 5).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getPriorityColor(action.priority)}`}>
                    {action.priority}
                  </span>
                  <span className="text-white">{action.description}</span>
                </div>
                <button
                  onClick={() => completeAction(action.id, 'completed')}
                  className="text-[#cfa15f] hover:text-white text-sm"
                >
                  Mark Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}