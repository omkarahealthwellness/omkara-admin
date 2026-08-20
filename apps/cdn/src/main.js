const REPO_OWNER = 'omkarahealthwellness';
const REPO_NAME = 'omkara-assets-products';
const BRANCH = 'main';



// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const processingState = document.getElementById('processing-state');
const statusText = document.getElementById('status-text');
const resultCard = document.getElementById('result-card');
const resultUrl = document.getElementById('result-url');
const copyBtn = document.getElementById('copy-btn');
const previewImg = document.getElementById('preview-img');

const loadGalleryBtn = document.getElementById('load-gallery-btn');
const galleryGrid = document.getElementById('gallery-grid');
const galleryStatus = document.getElementById('gallery-status');

// Drag & Drop Handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('drop', (e) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  // Reset UI
  resultCard.classList.add('hidden');
  processingState.classList.remove('hidden');
  statusText.textContent = 'Processing image...';

  try {
    // 1. Process Image
    const processedBlob = await processImage(file);
    statusText.textContent = 'Uploading to Photo Library...';

    // 2. Upload to GitHub
    const base64Data = await blobToBase64(processedBlob);
    const timestamp = Date.now();
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    const sanitizedName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Store everything in the root folder for the photo library
    const filename = `${sanitizedName}-${timestamp}.webp`;

    const cdnUrl = await uploadToGitHub(filename, base64Data);

    // 3. Show Result
    processingState.classList.add('hidden');
    resultCard.classList.remove('hidden');
    resultUrl.value = cdnUrl;
    previewImg.src = URL.createObjectURL(processedBlob);

    // 4. Refresh Library
    loadGallery();

  } catch (error) {
    processingState.classList.add('hidden');
    alert(`Error: ${error.message}`);
  }
}

async function processImage(file) {
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

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
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

async function uploadToGitHub(path, base64Content) {
  const apiUrl = 'https://omkara-admin.pages.dev/api/upload';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: path,
      content: base64Content,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'API upload failed');
  }
  
  const data = await response.json();
  return data.url;
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultUrl.value);
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = originalText), 2000);
});

// Gallery / Photo Library Logic
loadGalleryBtn.addEventListener('click', loadGallery);

async function loadGallery() {
  galleryGrid.innerHTML = '';
  galleryGrid.classList.add('hidden');
  galleryStatus.textContent = 'Loading photo library...';
  galleryStatus.classList.remove('hidden');

  try {
    // List contents via secure admin API
    const apiUrl = 'https://omkara-admin.pages.dev/api/gallery';

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Gallery load failed');
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      throw new Error('Expected a directory listing.');
    }

    // Filter images
    const images = files.filter(
      (f) =>
        f.type === 'file' &&
        (f.name.endsWith('.webp') || f.name.endsWith('.png') || f.name.endsWith('.jpg')),
    );

    // Sort images by date (newest first based on filename timestamp, or just reverse the array as GitHub sorts alphabetically)
    images.reverse();

    if (images.length === 0) {
      galleryStatus.textContent = 'No images found in your photo library.';
      return;
    }

    galleryGrid.classList.remove('hidden');
    galleryStatus.classList.add('hidden');

    images.forEach((file) => {
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${file.path}`;

      const item = document.createElement('div');
      item.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = cdnUrl;
      img.loading = 'lazy';

      const btn = document.createElement('button');
      btn.textContent = 'Copy Link';
      btn.onclick = () => {
        navigator.clipboard.writeText(cdnUrl);
        btn.textContent = 'Copied!';
        btn.style.background = '#4CAF50';
        setTimeout(() => {
          btn.textContent = 'Copy Link';
          btn.style.background = '';
        }, 2000);
      };

      item.appendChild(img);
      item.appendChild(btn);
      galleryGrid.appendChild(item);
    });
  } catch (error) {
    galleryStatus.textContent = `Error: ${error.message}`;
  }
}

// Automatically load the gallery on page load to act like a true photo library
document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
});
