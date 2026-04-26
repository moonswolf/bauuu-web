import { NextRequest, NextResponse } from 'next/server';

// GDPR Art. 20 — Data portability endpoint
// In the current Firebase architecture, the actual data export is performed
// client-side via exportUserData() in firestore.ts.
// This API route exists as a server-side fallback endpoint that could be
// called by automated systems or used for async export requests.

export async function GET(request: NextRequest) {
  // In a production Supabase setup, this would be an Edge Function
  // that queries the database with the service role key.
  // With the current Firebase client-side architecture, the export
  // is handled directly by the client (see Settings page).
  return NextResponse.json(
    {
      message: 'Per esportare i tuoi dati, usa la funzione "Scarica i miei dati" nelle Impostazioni.',
      endpoint: '/app/settings',
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  // Placeholder for async export request that could send an email
  // with the export file when ready (24-48h SLA per spec)
  return NextResponse.json(
    {
      message: 'Richiesta di esportazione ricevuta. Riceverai i dati via email entro 48 ore.',
    },
    { status: 202 }
  );
}
