"use client";

import { useState, useEffect } from "react";
import { Send, Mail, Calendar, Clock, CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react";

interface Report {
  id: string;
  report_type: string;
  title: string;
  summary: string;
  generated_at: string;
  sent_at: string | null;
  status: string;
}

export default function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/list');
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
    setLoading(false);
  };

  const sendReport = async (type: string) => {
    setSending(true);
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-report', type }),
      });
      const json = await res.json();
      alert(json.message);
      if (json.success) fetchReports();
    } catch (err) {
      console.error('Failed to send report:', err);
      alert('Failed to send report');
    }
    setSending(false);
  };

  const testEmail = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-email' }),
      });
      const json = await res.json();
      alert(json.message);
    } catch (err) {
      console.error('Failed to test email:', err);
      alert('Failed to send test email');
    }
    setSending(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle size={16} className="text-green-400" />;
      case 'failed': return <XCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-yellow-400" />;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar size={18} className="text-[#cfa15f]" />;
      case 'weekly': return <FileText size={18} className="text-blue-400" />;
      case 'monthly': return <Mail size={18} className="text-purple-400" />;
      default: return <FileText size={18} className="text-white/40" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail size={28} className="text-[#cfa15f]" />
        <div>
          <h2 className="text-2xl font-bold text-white">Automated Reports</h2>
          <p className="text-white/40 text-sm">Email reports to your inbox</p>
        </div>
      </div>

      {/* Email Configuration Display */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#cfa15f]/20 rounded-xl flex items-center justify-center">
            <Mail size={20} className="text-[#cfa15f]" />
          </div>
          <div>
            <div className="text-white font-medium">Sending to</div>
            <div className="text-white/40 text-sm">nirvaahlifestyle@gmail.com</div>
          </div>
        </div>
        <button
          onClick={testEmail}
          disabled={sending}
          className="text-[#cfa15f] text-sm hover:underline"
        >
          Test Email
        </button>
      </div>

      {/* Send Manual Reports */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Send Report Now</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => sendReport('daily')}
            disabled={sending}
            className="flex items-center gap-2 bg-[#cfa15f] text-black px-5 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50"
          >
            {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            Send Daily Report
          </button>
          <button
            onClick={() => sendReport('weekly')}
            disabled={sending}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white border border-white/10 px-5 py-3 rounded-xl font-medium hover:border-[#cfa15f]/30 transition-all disabled:opacity-50"
          >
            <FileText size={18} />
            Send Weekly Report
          </button>
          <button
            onClick={() => sendReport('monthly')}
            disabled={sending}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white border border-white/10 px-5 py-3 rounded-xl font-medium hover:border-[#cfa15f]/30 transition-all disabled:opacity-50"
          >
            <Mail size={18} />
            Send Monthly Report
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-white/60" />
          Report History
        </h3>
        {loading ? (
          <div className="text-white/40 text-center py-8">
            <RefreshCw size={24} className="animate-spin mx-auto" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-white/40 text-center py-8">No reports sent yet</div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  {getReportTypeIcon(report.report_type)}
                  <div>
                    <div className="text-white font-medium">{report.title}</div>
                    <div className="text-white/40 text-sm">{report.summary}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-white/40 text-sm">
                    {report.sent_at ? new Date(report.sent_at).toLocaleString() : '-'}
                  </div>
                  {getStatusIcon(report.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}