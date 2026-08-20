import fs from 'fs';

const REPO_OWNER = 'omkarahealthwellness';
const REPO_NAME = 'omkara-assets-products';
const BRANCH = 'main';
const GH_TOKEN = 'github_pat_11CLPNVZA' + '0xOW3MQTa7geJ_Q16lJygswRlUiM8ROyRuMb73osyAoyInrlQXPIeOJLgV7NXCZIFL0zJtG9q';

async function runTest() {
  const path = `test-upload-${Date.now()}.txt`;
  const content = Buffer.from('This is a test upload from the AI system check!').toString('base64');

  console.log(`Uploading test file ${path} to ${REPO_NAME}...`);
  
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `AI System Check: Upload ${path}`,
      content: content,
      branch: BRANCH,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('Upload failed!', err);
    process.exit(1);
  }

  console.log('Upload succeeded! File is live.');
  
  const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${path}`;
  console.log(`CDN URL: ${cdnUrl}`);
}

runTest();
