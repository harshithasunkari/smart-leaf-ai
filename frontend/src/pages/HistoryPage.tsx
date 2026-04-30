import React from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, ChevronRight, MoreHorizontal, Download, RefreshCw } from 'lucide-react';
import { listHistory, apiErrorMessage, type HistoryItem } from '@/src/services/api';
import { authStore } from '@/src/store/auth';
import { cn, formatDate, severityColor } from '@/src/utils/helpers';
import Spinner from '@/src/components/Spinner';

export default function HistoryPage() {
  const [records, setRecords] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    const user = authStore.getUser();
    if (!user) {
      setError('Not logged in');
      setLoading(false);
      return;
    }
    try {
      const response = await listHistory();
      setRecords(response.data.items);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.created_at.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Detection History</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {records.length} saved diagnosis records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative group max-w-lg">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by disease or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-semibold"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading history..." className="text-brand-600" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center">
          <p className="text-rose-700 font-medium">{error}</p>
          <button onClick={load} className="mt-3 text-rose-600 font-bold underline text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center">
          <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400 italic">No records found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search term.' : 'Run a scan to save your first diagnosis.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-50 bg-slate-50/40">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/60">
                    #
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/60">
                    Disease
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/60">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/60">
                {filtered.map((record, idx) => {
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400 font-bold">
                        {record.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{record.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{record.case_type}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {formatDate(record.created_at)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm py-2">
        <p className="font-bold text-slate-400">
          Showing {filtered.length} of {records.length} records
        </p>
      </div>
    </div>
  );
}