'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/admin';
import { AdminLog } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: Date | Timestamp | unknown): string => {
    if (!date) return 'N/A';
    const ts = date as { toDate?: () => Date };
    const d = ts.toDate ? ts.toDate() : new Date(date as string);
    return d.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nessuna azione registrata
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Azione</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Target</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.adminId.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.targetType && log.targetId
                      ? `${log.targetType}: ${log.targetId.slice(0, 8)}...`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {log.payload ? JSON.stringify(log.payload) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
