import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import { History, Search, Clock, ShieldCheck, User } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await adminService.getAuditLogs();
      setLogs(data);
    }
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const text = `${log.action} ${log.target_type} ${log.target_id || ''} ${JSON.stringify(log.details)}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Security &amp; Audit Trail"
        subtitle="Immutable records tracking administrative actions, mentor assignments, and marks verification"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <History className="w-3.5 h-3.5 text-violet-400" />
            <span>Immutable Governance Trail &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#777084] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Security Activity Log ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30263E]/40 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#777084]">
                      No audit records found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3 px-4 text-[#AAA2B8] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-sans">
                          <Clock className="w-3.5 h-3.5 text-[#777084]" />
                          <span>{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md font-sans">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#F5F3FA] font-sans">
                        {log.actor?.full_name || (
                          <span className="text-[11px] text-[#777084] font-mono">
                            {log.actor_id ? `${log.actor_id.substring(0, 8)}...` : 'System'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#AAA2B8]">
                        <span className="text-violet-300 font-semibold">{log.target_type}</span>
                        {log.target_id && (
                          <span className="text-[#777084] text-[10px] block font-mono">
                            {log.target_id.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#AAA2B8] max-w-xs font-sans truncate" title={JSON.stringify(log.details)}>
                        {log.details?.message || JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
