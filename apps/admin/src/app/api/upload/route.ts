import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, content } = body;

    if (!filename || !content) {
      return NextResponse.json({ error: 'Missing filename or content' }, { status: 400 });
    }

    const REPO_OWNER = 'omkarahealthwellness';
    const REPO_NAME = 'omkara-assets-products';
    const BRANCH = 'main';
    const GH_TOKEN = process.env.GITHUB_PAT;

    if (!GH_TOKEN) {
      console.error('Missing GITHUB_PAT in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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
      const err = await response.json();
      console.error('GitHub API error:', err);
      return NextResponse.json({ error: err.message || 'Upload failed' }, { status: response.status });
    }

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${filename}`;
    return NextResponse.json({ success: true, url: cdnUrl });

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
