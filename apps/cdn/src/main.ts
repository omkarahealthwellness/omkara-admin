import './style.css';

const REPO_OWNER = 'omkarahealthwellness';
const REPO_NAME = 'omkara-assets-products';
const BRANCH = 'main';

// DOM Elements
const tokenInput = document.getElementById('gh-token') as HTMLInputElement;
const folderInput = document.getElementById('gh-folder') as HTMLInputElement;
const dropZone = document.getElementById('drop-zone') as HTMLDivElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const processingState = document.getElementById('processing-state') as HTMLDivElement;
const statusText = document.getElementById('status-text') as HTMLParagraphElement;
const resultCard = document.getElementById('result-card') as HTMLDivElement;
const resultUrl = document.getElementById('result-url') as HTMLInputElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const previewImg = document.getElementById('preview-img') as HTMLImageElement;

// Load saved settings
const savedToken = localStorage.getItem('omkara_gh_token');
if (savedToken) tokenInput.value = savedToken;
const savedFolder = localStorage.getItem('omkara_gh_folder');
if (savedFolder) folderInput.value = savedFolder;

// Save settings on change
tokenInput.addEventListener('change', () =>
  localStorage.setItem('omkara_gh_token', tokenInput.value),
);
folderInput.addEventListener('change', () =>
  localStorage.setItem('omkara_gh_folder', folderInput.value),
);

// Drag & Drop Handlers
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});
fileInput.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0]);
  }
});

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  const token = tokenInput.value.trim();
  if (!token) {
    alert('Please enter your GitHub PAT in the settings.');
    return;
  }

  // Reset UI
  resultCard.classList.add('hidden');
  processingState.classList.remove('hidden');
  statusText.textContent = 'Processing image...';

  try {
    // 1. Process Image
    const processedBlob = await processImage(file);
    statusText.textContent = 'Uploading to GitHub...';

    // 2. Upload to GitHub
    const base64Data = await blobToBase64(processedBlob);
    const folder = folderInput.value.trim() ? `${folderInput.value.trim()}/` : '';
    // Unique filename to prevent jsdelivr caching issues
    const timestamp = Date.now();
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    const sanitizedName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${folder}${sanitizedName}-${timestamp}.webp`;

    const cdnUrl = await uploadToGitHub(filename, base64Data, token);

    // 3. Show Result
    processingState.classList.add('hidden');
    resultCard.classList.remove('hidden');
    resultUrl.value = cdnUrl;
    previewImg.src = URL.createObjectURL(processedBlob);
  } catch (error: any) {
    processingState.classList.add('hidden');
    alert(`Error: ${error.message}`);
  }
}

async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      // Max dimension 1200px
      const MAX_SIZE = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP, 85% quality
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion to WebP failed'));
        },
        'image/webp',
        0.85,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Strip the data:image/webp;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function uploadToGitHub(path: string, base64Content: string, token: string): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${path} via Omkara CDN Processor`,
      content: base64Content,
      branch: BRANCH,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'GitHub API upload failed');
  }

  // Construct jsDelivr URL
  return `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${path}`;
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultUrl.value);
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = originalText), 2000);
});
