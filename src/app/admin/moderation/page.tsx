'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReports, updateReportStatus, logAdminAction } from '@/lib/admin';
import { Report, ReportStatus, REPORT_REASON_LABELS } from '@/types';

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'In attesa' },
  { value: 'reviewing', label: 'In revisione' },
  { value: 'actioned', label: 'Risolte' },
  { value: 'dismissed', label: 'Archiviate' },
  { value: 'all', label: 'Tutte' },
];

export default function AdminModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('pending');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports(activeTab === 'all' ? undefined : activeTab);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const handleAction = async (reportId: string, status: ReportStatus, notes?: string) => {
    if (!user) return;
    try {
      await updateReportStatus(reportId, status, user.uid, notes);
      await logAdminAction(user.uid, `report_${status}`, 'report', reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderazione segnalazioni</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nessuna segnalazione {activeTab !== 'all' ? `con stato "${activeTab}"` : ''}
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-medium text-sm">{REPORT_REASON_LABELS[report.reason]}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Segnalato da: {report.reporterId.slice(0, 8)}...
                    {report.reportedProfileId && ` | Profilo: ${report.reportedProfileId.slice(0, 8)}...`}
                    {report.reportedDogId && ` | Cane: ${report.reportedDogId.slice(0, 8)}...`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'actioned' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {report.status}
                </span>
              </div>

              {report.details && (
                <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">{report.details}</p>
              )}

              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(report.id, 'reviewing')}
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Prendi in carico
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'actioned', 'Azione intrapresa')}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Azione
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'dismissed', 'Non rilevante')}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Archivia
                  </button>
                </div>
              )}

              {report.status === 'reviewing' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(report.id, 'actioned', 'Azione intrapresa')}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Azione
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'dismissed', 'Non rilevante')}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Archivia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
