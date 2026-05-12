import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import type { VCContact } from '../../../lib/types';

interface ExportRequest {
  vcs: VCContact[];
  title?: string;
}

const COLUMNS: { key: keyof VCContact; label: string }[] = [
  { key: 'fundName', label: 'Fund Name' },
  { key: 'aliveOrDead', label: 'Status' },
  { key: 'wave', label: 'Wave' },
  { key: 'contactName', label: 'Contact Name' },
  { key: 'stageOfConversation', label: 'Stage of Conversation' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'conversationNotes', label: 'Conversation Notes' },
  { key: 'ejfConnection', label: 'EJF Connection' },
  { key: 'optimistConnection', label: 'Optimist Connection' },
  { key: 'runyonConnection', label: 'Runyon Connection' },
  { key: 'connectedBy', label: 'Connected By' },
  { key: 'dataRoom', label: 'Data Room' },
  { key: 'customerCalls', label: 'Customer Calls' },
  { key: 'insurtechFintechInvestments', label: 'Insurtech/Fintech Investments' },
];

// Status column is at index 1 (column B in A1 notation).
const STATUS_COLUMN_INDEX = 1;

// Same status-then-wave sort as the dashboard read view.
function statusRank(s: string): number {
  if (s === 'Alive') return 0;
  if (s === 'Avoid') return 1;
  if (s === 'Dead') return 2;
  return 3;
}
function sortVCsForExport(list: VCContact[]): VCContact[] {
  return [...list].sort((a, b) => {
    const rankDiff = statusRank(a.aliveOrDead) - statusRank(b.aliveOrDead);
    if (rankDiff !== 0) return rankDiff;
    const waveA = (a.wave || '').trim();
    const waveB = (b.wave || '').trim();
    if (!waveA && !waveB) return 0;
    if (!waveA) return 1;
    if (!waveB) return -1;
    return parseFloat(waveA) - parseFloat(waveB);
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = session.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: 'No Google access token. Sign out and sign back in to grant access to Google Sheets.' },
      { status: 403 },
    );
  }
  if (session.error === 'RefreshAccessTokenError') {
    return NextResponse.json(
      { error: 'Your Google session expired. Sign out and sign back in.' },
      { status: 403 },
    );
  }

  let body: ExportRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { vcs, title } = body;
  if (!Array.isArray(vcs)) {
    return NextResponse.json({ error: 'Field `vcs` must be an array' }, { status: 400 });
  }

  const sheetTitle =
    title ||
    `Helm VC Pipeline – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // ---------- Step 1: create the spreadsheet ----------
  const headerCells = COLUMNS.map(col => ({
    userEnteredValue: { stringValue: col.label },
    userEnteredFormat: {
      textFormat: { bold: true },
      backgroundColor: { red: 0.96, green: 0.94, blue: 0.86 },
      horizontalAlignment: 'LEFT' as const,
      wrapStrategy: 'WRAP' as const,
    },
  }));

  const sortedVCs = sortVCsForExport(vcs);
  const dataRows = sortedVCs.map(c => ({
    values: COLUMNS.map(col => ({
      userEnteredValue: { stringValue: String(c[col.key] ?? '') },
      userEnteredFormat: { wrapStrategy: 'WRAP' as const, verticalAlignment: 'TOP' as const },
    })),
  }));

  const createBody = {
    properties: { title: sheetTitle, locale: 'en_US' },
    sheets: [
      {
        properties: {
          title: 'VC Pipeline',
          gridProperties: { frozenRowCount: 1 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [{ values: headerCells }, ...dataRows],
          },
        ],
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Sheets create failed:', createRes.status, errText);
    let message = `Google Sheets API rejected the request (HTTP ${createRes.status}).`;
    if (createRes.status === 401 || createRes.status === 403) {
      message += ' Make sure the Google Sheets and Drive APIs are enabled in your Google Cloud project, and that the scopes are granted to this OAuth client. You may need to sign out and back in.';
    }
    return NextResponse.json({ error: message, details: errText }, { status: 500 });
  }

  const sheetData = (await createRes.json()) as {
    spreadsheetId: string;
    spreadsheetUrl: string;
    sheets?: Array<{ properties?: { sheetId?: number } }>;
  };
  const firstSheetId = sheetData.sheets?.[0]?.properties?.sheetId ?? 0;

  // ---------- Step 2: conditional formatting for Avoid rows ----------
  // The Sheets API doesn't accept conditional format rules in the initial
  // create call, so we attach them with a follow-up batchUpdate. We reference
  // the Status column ($B<row>) so the highlight stays correct even if the
  // user re-sorts the sheet later.
  const cfRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetData.spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId: firstSheetId,
                    startRowIndex: 1, // skip header
                    startColumnIndex: 0,
                    endColumnIndex: COLUMNS.length,
                  },
                ],
                booleanRule: {
                  condition: {
                    type: 'CUSTOM_FORMULA',
                    values: [
                      {
                        userEnteredValue: `=$${String.fromCharCode(65 + STATUS_COLUMN_INDEX)}2="Avoid"`,
                      },
                    ],
                  },
                  format: {
                    // Pale lavender — matches the dashboard's Avoid row tint (#F0EBF7)
                    backgroundColor: { red: 0.941, green: 0.922, blue: 0.969 },
                  },
                },
              },
              index: 0,
            },
          },
        ],
      }),
    },
  );
  if (!cfRes.ok) {
    const errText = await cfRes.text();
    console.error('Conditional formatting failed (non-fatal):', cfRes.status, errText);
    // Continue — the sheet is still usable, just without auto-highlighting
  }

  // ---------- Step 3: share with "anyone with the link" as commenter ----------
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${sheetData.spreadsheetId}/permissions?supportsAllDrives=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'commenter', type: 'anyone' }),
    },
  );

  if (!permRes.ok) {
    const errText = await permRes.text();
    console.error('Drive permission failed:', permRes.status, errText);
    return NextResponse.json({
      url: sheetData.spreadsheetUrl,
      warning:
        'Sheet created, but link sharing failed — you may need to open it and share manually.',
      details: errText,
    });
  }

  return NextResponse.json({
    url: sheetData.spreadsheetUrl,
    title: sheetTitle,
    rowCount: vcs.length,
  });
}
