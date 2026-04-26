'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFeatureFlags, updateFeatureFlag, logAdminAction } from '@/lib/admin';
import { FeatureFlag } from '@/types';

export default function AdminFlagsPage() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureFlags()
      .then(setFlags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    if (!user) return;
    const newEnabled = !flag.enabled;
    try {
      await updateFeatureFlag(flag.key, newEnabled, flag.rolloutPct);
      await logAdminAction(user.uid, 'toggle_flag', 'flag' as never, flag.key, { enabled: newEnabled });
      setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: newEnabled } : f));
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const handleRolloutChange = async (flag: FeatureFlag, pct: number) => {
    if (!user) return;
    try {
      await updateFeatureFlag(flag.key, flag.enabled, pct);
      await logAdminAction(user.uid, 'update_flag_rollout', 'flag' as never, flag.key, { rolloutPct: pct });
      setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, rolloutPct: pct } : f));
    } catch (error) {
      console.error('Error updating rollout:', error);
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feature Flags</h1>

      {flags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nessun feature flag configurato. Aggiungili dalla collezione &quot;featureFlags&quot; in Firestore.
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map(flag => (
            <div key={flag.key} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-sm">{flag.key}</span>
                  {flag.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{flag.description}</p>
                  )}
                </div>
                <button
                  role="switch"
                  aria-checked={flag.enabled}
                  onClick={() => handleToggle(flag)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    flag.enabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      flag.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Rollout:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={flag.rolloutPct}
                  onChange={e => handleRolloutChange(flag, parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-700 w-10 text-right">{flag.rolloutPct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
