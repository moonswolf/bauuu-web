'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import {
  updateNotificationPrefs,
  updateHideFromDiscovery,
  softDeleteAccount,
  cancelAccountDeletion,
  exportUserData,
  getBlockedUsers,
  unblockUser,
  updateUserProfile,
} from '@/lib/firestore';
import { NotificationPrefs, Block } from '@/types';

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  matches: true,
  messages: true,
  likes: false,
  events: true,
};

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Block[]>([]);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [hideFromDiscovery, setHideFromDiscovery] = useState(false);
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      setNotifPrefs(userProfile.notificationPrefs || DEFAULT_NOTIFICATION_PREFS);
      setHideFromDiscovery(userProfile.hideFromDiscovery || false);
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (user) {
      loadBlockedUsers();
    }
  }, [user]);

  const loadBlockedUsers = async () => {
    if (!user) return;
    try {
      const blocks = await getBlockedUsers(user.uid);
      setBlockedUsers(blocks);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleNotifChange = async (key: keyof NotificationPrefs) => {
    if (!user) return;
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      await updateNotificationPrefs(user.uid, updated);
      showSuccess('Preferenze notifiche aggiornate');
    } catch (error) {
      console.error('Error updating notification prefs:', error);
      setNotifPrefs(notifPrefs); // revert
    }
  };

  const handleHideToggle = async () => {
    if (!user) return;
    const newVal = !hideFromDiscovery;
    setHideFromDiscovery(newVal);
    try {
      await updateHideFromDiscovery(user.uid, newVal);
      showSuccess(newVal ? 'Profilo nascosto dalla discovery' : 'Profilo visibile nella discovery');
    } catch (error) {
      console.error('Error updating hide from discovery:', error);
      setHideFromDiscovery(!newVal); // revert
    }
  };

  const handleEmailChange = async () => {
    if (!user || !email.trim()) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { email });
      showSuccess('Email aggiornata');
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Errore durante l\'aggiornamento dell\'email');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExportLoading(true);
    try {
      const data = await exportUserData(user.uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bauuu-dati-${user.uid}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Dati esportati con successo');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Errore durante l\'esportazione dei dati');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await softDeleteAccount(user.uid);
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Errore durante l\'eliminazione dell\'account');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await cancelAccountDeletion(user.uid);
      showSuccess('Eliminazione annullata');
    } catch (error) {
      console.error('Error canceling deletion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;
    try {
      await unblockUser(user.uid, blockedId);
      setBlockedUsers(prev => prev.filter(b => b.blockedId !== blockedId));
      showSuccess('Utente sbloccato');
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleSignOut = async () => {
    if (!confirm('Sei sicuro di voler uscire?')) return;
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAccountPendingDeletion = !!userProfile?.deletedAt;

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
          <button
            onClick={() => router.push('/app/profile')}
            className="text-primary-500 text-sm font-medium"
          >
            Torna al profilo
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm" role="status">
            {successMsg}
          </div>
        )}

        {isAccountPendingDeletion && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium mb-2">
              Il tuo account è in fase di eliminazione
            </p>
            <p className="text-red-600 text-sm mb-3">
              L&apos;account sarà eliminato definitivamente tra 30 giorni.
              Puoi annullare l&apos;eliminazione in qualsiasi momento.
            </p>
            <button
              onClick={handleCancelDeletion}
              disabled={loading}
              className="btn btn-primary text-sm px-4 py-2"
            >
              Annulla eliminazione
            </button>
          </div>
        )}

        {/* Notifications */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifiche</h2>
          <div className="space-y-4">
            {([
              { key: 'matches' as const, label: 'Nuovi match' },
              { key: 'messages' as const, label: 'Nuovi messaggi' },
              { key: 'likes' as const, label: 'Like ricevuti' },
              { key: 'events' as const, label: 'Eventi e novità' },
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  role="switch"
                  aria-checked={notifPrefs[key]}
                  onClick={() => handleNotifChange(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifPrefs[key] ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifPrefs[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>

          <label className="flex items-center justify-between cursor-pointer mb-4">
            <div>
              <span className="text-sm text-gray-700 block">Nascondi profilo dalla discovery</span>
              <span className="text-xs text-gray-500">Il tuo profilo non apparirà agli altri utenti</span>
            </div>
            <button
              role="switch"
              aria-checked={hideFromDiscovery}
              onClick={handleHideToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hideFromDiscovery ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hideFromDiscovery ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {/* Blocked users list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Utenti bloccati</h3>
            {blockedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun utente bloccato</p>
            ) : (
              <ul className="space-y-2">
                {blockedUsers.map((block) => (
                  <li key={block.blockedId} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Utente {block.blockedId.slice(0, 8)}...</span>
                    <button
                      onClick={() => handleUnblock(block.blockedId)}
                      className="text-sm text-primary-500 hover:text-primary-600"
                    >
                      Sblocca
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Account */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>

          {/* Change email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-1"
              />
              <button
                onClick={handleEmailChange}
                disabled={loading || email === userProfile.email}
                className="btn btn-primary text-sm px-4 py-2"
              >
                Salva
              </button>
            </div>
          </div>

          {/* Export data */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Esporta i tuoi dati</h3>
            <p className="text-xs text-gray-500 mb-3">
              Scarica una copia di tutti i tuoi dati in formato JSON (GDPR Art. 20).
            </p>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="btn btn-outline text-sm px-4 py-2"
            >
              {exportLoading ? 'Esportando...' : 'Scarica i miei dati'}
            </button>
          </div>

          {/* Delete account */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-red-600 mb-2">Elimina account</h3>
            <p className="text-xs text-gray-500 mb-3">
              L&apos;account verrà disattivato immediatamente e cancellato definitivamente dopo 30 giorni.
              I messaggi inviati saranno anonimizzati, non eliminati.
            </p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn bg-red-500 text-white hover:bg-red-600 text-sm px-4 py-2"
              >
                Elimina il mio account
              </button>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 mb-3">
                  Sei sicuro? Questa azione è irreversibile dopo 30 giorni.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="btn bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2"
                  >
                    {loading ? 'Eliminando...' : 'Conferma eliminazione'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn btn-secondary text-sm px-4 py-2"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sign out */}
        <div className="mb-6">
          <button
            onClick={handleSignOut}
            className="w-full btn bg-gray-200 text-gray-900 hover:bg-gray-300"
          >
            Esci
          </button>
        </div>

        {/* Safety center */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Centro sicurezza</h2>
          <p className="text-sm text-gray-600 mb-4">
            Se sei in pericolo o hai bisogno di aiuto, contatta i servizi dedicati:
          </p>
          <div className="space-y-3">
            <a
              href="tel:1522"
              className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="text-2xl">📞</span>
              <div>
                <span className="text-sm font-medium text-red-800 block">1522 — Antiviolenza</span>
                <span className="text-xs text-red-600">Numero verde contro la violenza e lo stalking</span>
              </div>
            </a>
            <a
              href="https://www.commissariatodips.it/youpol/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">🛡️</span>
              <div>
                <span className="text-sm font-medium text-blue-800 block">YouPol</span>
                <span className="text-xs text-blue-600">Segnala alla Polizia di Stato</span>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
