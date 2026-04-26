'use client';

import { useState, useEffect } from 'react';
import { getKPIStats, KPIStats } from '@/lib/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKPIStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  const kpiCards = [
    { label: 'Utenti totali', value: stats?.totalUsers ?? 0, icon: '👥' },
    { label: 'Cani registrati', value: stats?.totalDogs ?? 0, icon: '🐕' },
    { label: 'Match totali', value: stats?.totalMatches ?? 0, icon: '💕' },
    { label: 'Swipe totali', value: stats?.totalSwipes ?? 0, icon: '👆' },
    { label: 'Segnalazioni aperte', value: stats?.pendingReports ?? 0, icon: '🚩', alert: (stats?.pendingReports ?? 0) > 0 },
    { label: 'Foto da moderare', value: stats?.pendingPhotos ?? 0, icon: '📷', alert: (stats?.pendingPhotos ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpiCards.map(card => (
          <div
            key={card.label}
            className={`bg-white rounded-lg p-4 border ${
              card.alert ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{card.icon}</span>
              <span className="text-sm text-gray-600">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.alert ? 'text-red-600' : 'text-gray-900'}`}>
              {card.value.toLocaleString('it-IT')}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metriche chiave</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Match rate (match/swipe)</span>
              <span className="font-medium">
                {stats && stats.totalSwipes > 0
                  ? `${((stats.totalMatches / stats.totalSwipes) * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cani per utente (media)</span>
              <span className="font-medium">
                {stats && stats.totalUsers > 0
                  ? (stats.totalDogs / stats.totalUsers).toFixed(1)
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni rapide</h2>
          <div className="space-y-2">
            <a href="/admin/moderation" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Gestisci segnalazioni ({stats?.pendingReports ?? 0} in attesa)
            </a>
            <a href="/admin/photos" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Modera foto ({stats?.pendingPhotos ?? 0} in attesa)
            </a>
            <a href="/admin/seed" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Crea profili seed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
