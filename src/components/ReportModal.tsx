'use client';

import { useState } from 'react';
import { submitReport, blockUser } from '@/lib/firestore';
import { ReportReason, REPORT_REASON_LABELS } from '@/types';

interface ReportModalProps {
  reporterId: string;
  reportedProfileId?: string;
  reportedDogId?: string;
  reportedMessageId?: string;
  onClose: () => void;
  onReported?: () => void;
}

const REPORT_REASONS: ReportReason[] = [
  'impersonation',
  'harassment',
  'minor',
  'scam',
  'nudity',
  'hate_speech',
  'offplatform',
  'animal_abuse',
  'other',
];

export default function ReportModal({
  reporterId,
  reportedProfileId,
  reportedDogId,
  reportedMessageId,
  onClose,
  onReported,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [autoBlock, setAutoBlock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await submitReport({
        reporterId,
        reportedProfileId,
        reportedDogId,
        reportedMessageId,
        reason,
        details,
      });

      // Auto-block the reported user (spec §4.9: auto-block soft after report)
      if (autoBlock && reportedProfileId) {
        await blockUser(reporterId, reportedProfileId);
      }

      setSubmitted(true);
      onReported?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Errore durante l\'invio della segnalazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Segnalazione inviata
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                La prenderemo in carico entro 24 ore. Grazie per aver contribuito a rendere Bauuu più sicuro.
              </p>
              {autoBlock && reportedProfileId && (
                <p className="text-xs text-gray-500 mb-4">
                  L&apos;utente segnalato è stato nascosto dal tuo feed.
                </p>
              )}
              <button
                onClick={onClose}
                className="btn btn-primary text-sm px-6 py-2"
              >
                Chiudi
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 id="report-modal-title" className="text-lg font-semibold text-gray-900">
                  Segnala
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  aria-label="Chiudi"
                >
                  &times;
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Seleziona il motivo della segnalazione. Il team di moderazione esaminerà il caso entro 24 ore.
              </p>

              {/* Reason selection */}
              <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 mb-2">Motivo</legend>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{REPORT_REASON_LABELS[r]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Details */}
              <div className="mb-4">
                <label htmlFor="report-details" className="block text-sm font-medium text-gray-700 mb-2">
                  Dettagli (opzionale)
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="input h-24 resize-none"
                  placeholder="Descrivi cosa è successo..."
                  maxLength={1000}
                />
              </div>

              {/* Auto-block toggle */}
              {reportedProfileId && (
                <label className="flex items-center gap-2 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBlock}
                    onChange={(e) => setAutoBlock(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    Blocca anche questo utente
                  </span>
                </label>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!reason || loading}
                  className="btn btn-primary flex-1 text-sm px-4 py-2"
                >
                  {loading ? 'Inviando...' : 'Invia segnalazione'}
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary text-sm px-4 py-2"
                >
                  Annulla
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
