'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/frontend/components/AppShell';
import {
  FileText,
  Download,
  Search,
  Filter,
  DoorOpen,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  category: string;
  action: string;
  target: string;
  borrower: string;
  attendees: number;
  purpose: string;
  staff: string;
  timestamp: string;
  conditionGrade?: string;
  notes?: string;
  status: string;
}

export default function AdminAuditView() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/audit?limit=150');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit ledger');
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Timestamp',
      'Category',
      'Action',
      'Target Asset/Room',
      'Borrower',
      'Staff Officer',
      'Status',
      'Condition Grade',
      'Notes',
    ];

    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.borrower}"`,
      `"${l.staff}"`,
      `"${l.status}"`,
      `"${l.conditionGrade || 'N/A'}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `cjc_lirc_audit_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#8B1515] border border-red-200">
                Institutional Auditing
              </span>
              <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
                System Audit Trail & Ledgers
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Chronological log of staff actions, student room reservations, hardware condition checks, and overrides.
            </p>
          </div>

          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV Report</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by borrower, staff, room, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Operations</option>
              <option value="Discussion Room">Discussion Rooms</option>
              <option value="Laptop Circulation">Laptop Circulation</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1515] mb-2" />
              <span>Compiling institutional audit logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No recorded transactions found in ledger.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Desk Module</th>
                    <th className="py-3 px-4">Operation & Target</th>
                    <th className="py-3 px-4">Borrower / Student</th>
                    <th className="py-3 px-4">Staff Officer</th>
                    <th className="py-3 px-4">Status & Condition</th>
                    <th className="py-3 px-4">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-mono text-[11px] font-semibold text-slate-700">
                          {new Date(l.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px]">
                          {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l.category === 'Discussion Room'
                              ? 'bg-red-50 text-[#8B1515] border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {l.category === 'Discussion Room' ? (
                            <DoorOpen className="w-3 h-3 shrink-0" />
                          ) : (
                            <Laptop className="w-3 h-3 shrink-0" />
                          )}
                          <span>{l.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{l.action}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{l.target}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{l.borrower}</div>
                        {l.category === 'Discussion Room' && (
                          <div className="text-[10px] text-slate-500">{l.attendees} Students</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {l.staff}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="capitalize font-semibold text-[11px] text-slate-700">{l.status}</div>
                        {l.conditionGrade && (
                          <div className="text-[10px] text-slate-500">Grade: {l.conditionGrade}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {l.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
