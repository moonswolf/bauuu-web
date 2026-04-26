'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserDetails, suspendUser, unsuspendUser, setUserRole, logAdminAction } from '@/lib/admin';
import { UserProfile, Dog, Report, UserRole, REPORT_REASON_LABELS } from '@/types';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser } = useAuth();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  useEffect(() => {
    getUserDetails(userId)
      .then(data => {
        setProfile(data.profile);
        setDogs(data.dogs);
        setReports(data.reports);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSuspend = async () => {
    if (!adminUser || !suspendReason.trim()) return;
    await suspendUser(userId, suspendReason);
    await logAdminAction(adminUser.uid, 'suspend_user', 'profile', userId, { reason: suspendReason });
    setProfile(prev => prev ? { ...prev, isSuspended: true } as UserProfile & { isSuspended: boolean } : null);
    setShowSuspendForm(false);
    setSuspendReason('');
  };

  const handleUnsuspend = async () => {
    if (!adminUser) return;
    await unsuspendUser(userId);
    await logAdminAction(adminUser.uid, 'unsuspend_user', 'profile', userId);
    setProfile(prev => prev ? { ...prev, isSuspended: false } as UserProfile & { isSuspended: boolean } : null);
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!adminUser) return;
    await setUserRole(userId, newRole);
    await logAdminAction(adminUser.uid, 'change_role', 'profile', userId, { newRole });
    setProfile(prev => prev ? { ...prev, role: newRole } : null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-gray-500 py-20">Utente non trovato</p>;
  }

  const isSuspended = (profile as UserProfile & { isSuspended?: boolean }).isSuspended;

  return (
    <div>
      <button onClick={() => router.push('/admin/users' as never)} className="text-sm text-primary-500 mb-4 hover:underline">
        &larr; Torna alla lista
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.displayName}
                  {profile.isSeed && <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Seed</span>}
                </h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-xs text-gray-400 mt-1">ID: {profile.id}</p>
              </div>
              {isSuspended && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Sospeso</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Bio:</span> {profile.bio || 'Nessuna'}</div>
              <div><span className="text-gray-500">Genere:</span> {profile.gender}</div>
              <div><span className="text-gray-500">Profilo completo:</span> {profile.profileComplete ? 'Si' : 'No'}</div>
              <div><span className="text-gray-500">Premium:</span> {profile.isPremium ? 'Si' : 'No'}</div>
            </div>
          </div>

          {/* Dogs */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cani ({dogs.length})</h2>
            {dogs.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun cane registrato</p>
            ) : (
              <div className="space-y-4">
                {dogs.map(dog => (
                  <div key={dog.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    {dog.photos[0] && (
                      <img src={dog.photos[0]} alt={dog.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium">{dog.name}</p>
                      <p className="text-sm text-gray-500">{dog.breed} - {dog.sizeCategory} - {dog.energyLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports against this user */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Segnalazioni ricevute ({reports.length})</h2>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500">Nessuna segnalazione</p>
            ) : (
              <div className="space-y-2">
                {reports.map(report => (
                  <div key={report.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{REPORT_REASON_LABELS[report.reason]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'actioned' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>{report.status}</span>
                    </div>
                    {report.details && <p className="text-gray-600 mt-1">{report.details}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni</h2>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
              <select
                value={profile.role || 'user'}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="input text-sm"
              >
                <option value="user">Utente</option>
                <option value="moderator">Moderatore</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            {/* Suspend / Unsuspend */}
            {isSuspended ? (
              <button onClick={handleUnsuspend} className="w-full btn bg-green-500 text-white hover:bg-green-600 text-sm py-2 mb-2">
                Riattiva utente
              </button>
            ) : (
              <>
                {!showSuspendForm ? (
                  <button onClick={() => setShowSuspendForm(true)} className="w-full btn bg-red-500 text-white hover:bg-red-600 text-sm py-2 mb-2">
                    Sospendi utente
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg mb-2">
                    <textarea
                      value={suspendReason}
                      onChange={e => setSuspendReason(e.target.value)}
                      placeholder="Motivo della sospensione..."
                      className="input text-sm mb-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSuspend} className="btn bg-red-600 text-white text-xs py-1.5 px-3">
                        Conferma
                      </button>
                      <button onClick={() => setShowSuspendForm(false)} className="btn btn-secondary text-xs py-1.5 px-3">
                        Annulla
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
