import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const REPO_OWNER = 'omkarahealthwellness';
    const REPO_NAME = 'omkara-assets-products';
    const BRANCH = 'main';
    const GH_TOKEN = process.env.GITHUB_PAT;

    if (!GH_TOKEN) {
      console.error('Missing GITHUB_PAT in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/?ref=${BRANCH}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Omkara-Admin-Gallery',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]); // Empty directory
      }
      const err = await response.json();
      return NextResponse.json({ error: err.message || 'Gallery load failed' }, { status: response.status });
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      return NextResponse.json({ error: 'Expected directory listing' }, { status: 500 });
    }

    return NextResponse.json(files);

  } catch (error) {
    console.error('Gallery route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
