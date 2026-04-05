"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Package, CheckCircle, XCircle, RefreshCw, TrendingDown } from "lucide-react";

interface Alert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  predictedDaysLeft: number;
  status: string;
  alertType: string;
  createdAt: string;
}

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts/reorder${filter !== 'all' ? `?status=${filter}` : ''}`);
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.alerts || []);
        setLiveAlerts(json.liveAlerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
    setLoading(false);
  };

  const checkNewAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to check alerts:', err);
    }
  };

  const updateAlertStatus = async (alertId: string, action: string) => {
    try {
      const res = await fetch('/api/alerts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, alertId }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'acknowledged': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'dismissed': return 'bg-white/10 text-white/40 border-white/20';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock': return <XCircle size={16} className="text-red-400" />;
      case 'depletion_warning': return <TrendingDown size={16} className="text-orange-400" />;
      default: return <AlertTriangle size={16} className="text-yellow-400" />;
    }
  };

  const criticalCount = liveAlerts.filter(a => a.daysLeft <= 5).length;
  const warningCount = liveAlerts.filter(a => a.daysLeft > 5 && a.daysLeft <= 10).length;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell size={28} className="text-[#cfa15f]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Inventory Alerts</h2>
            <p className="text-white/40 text-sm">Reorder alerts and stock warnings</p>
          </div>
        </div>
        <button
          onClick={checkNewAlerts}
          disabled={loading}
          className="flex items-center gap-2 bg-[#cfa15f] text-black px-4 py-2 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Checking..." : "Check Inventory"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            Critical (≤5 days)
          </div>
          <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
            <AlertTriangle size={16} className="text-yellow-400" />
            Warning (6-10 days)
          </div>
          <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
            <Package size={16} className="text-[#cfa15f]" />
            Live Alerts
          </div>
          <div className="text-3xl font-bold text-white">{liveAlerts.length}</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
            <Bell size={16} className="text-white/60" />
            Pending Actions
          </div>
          <div className="text-3xl font-bold text-white">{alerts.filter(a => a.status === 'pending').length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['pending', 'acknowledged', 'resolved', 'dismissed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === status
                ? "bg-[#cfa15f] text-black"
                : "bg-[#111] text-white/60 border border-white/10 hover:border-[#cfa15f]/30"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Live Alerts */}
      {liveAlerts.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-[#cfa15f]" />
            Current Stock Status
          </h3>
          <div className="space-y-3">
            {liveAlerts.map((alert: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  {getAlertTypeIcon(alert.daysLeft <= 5 ? 'depletion_warning' : 'low_stock')}
                  <div>
                    <div className="text-white font-medium">{alert.product}</div>
                    <div className="text-white/40 text-sm">Stock: {alert.stock} | Threshold: {alert.threshold}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${alert.daysLeft <= 5 ? 'text-red-400' : alert.daysLeft <= 10 ? 'text-yellow-400' : 'text-white'}`}>
                    {alert.daysLeft === 999 ? '∞' : alert.daysLeft} days left
                  </div>
                  <div className="text-white/40 text-xs">at current rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert History */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-white/60" />
          Alert History
        </h3>
        {loading ? (
          <div className="text-white/40 text-center py-8">
            <RefreshCw size={24} className="animate-spin mx-auto" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-white/40 text-center py-8">No alerts found</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  {getAlertTypeIcon(alert.alertType)}
                  <div>
                    <div className="text-white font-medium">{alert.productName}</div>
                    <div className="text-white/40 text-sm">
                      Stock: {alert.currentStock} | Predicted: {alert.predictedDaysLeft} days
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                  {alert.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'acknowledge')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'resolve')}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}