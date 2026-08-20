import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://omkara-cdn.pages.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { filename: string; content: string };
    const { filename, content } = body;

    if (!filename || !content) {
      return NextResponse.json({ error: 'Missing filename or content' }, { status: 400, headers: CORS_HEADERS });
    }

    const REPO_OWNER = 'omkarahealthwellness';
    const REPO_NAME = 'omkara-assets-products';
    const BRANCH = 'main';
    const GH_TOKEN = process.env.GITHUB_PAT;

    if (!GH_TOKEN) {
      console.error('Missing GITHUB_PAT in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: CORS_HEADERS });
    }

    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Omkara-Admin-Upload',
      },
      body: JSON.stringify({
        message: `Upload ${filename} via Secure API`,
        content: content,
        branch: BRANCH,
      }),
    });

    if (!response.ok) {
      const err = (await response.json()) as any;
      console.error('GitHub API error:', err);
      return NextResponse.json({ error: err.message || 'Upload failed' }, { status: response.status, headers: CORS_HEADERS });
    }

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${filename}`;
    return NextResponse.json({ success: true, url: cdnUrl }, { headers: CORS_HEADERS });

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}
