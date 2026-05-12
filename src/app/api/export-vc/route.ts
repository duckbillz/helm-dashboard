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

  const dataRows = vcs.map(c => ({
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
  };

  // ---------- Step 2: share with "anyone with the link" as commenter ----------
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
