import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const inputDir = process.argv[2] || './raw-images';
const outputDir = process.argv[3] || './optimized';

async function processDirectory(srcDir, destDir) {
  try {
    await fs.mkdir(destDir, { recursive: true });
    
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules or output directory
        if (entry.name === 'node_modules' || srcPath === path.resolve(outputDir)) continue;
        
        const destPath = path.join(destDir, entry.name);
        await processDirectory(srcPath, destPath);
        continue;
      }
      
      if (!entry.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        continue;
      }
      
      console.log(`Processing: ${entry.name}`);
      const filename = path.parse(entry.name).name;
      
      const image = sharp(srcPath);
      
      // Desktop sizes (max 1600px)
      const desktopImg = image.clone().resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true
      });
      
      // Mobile sizes (max 800px)
      const mobileImg = image.clone().resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true
      });
      
      // Save WebP & AVIF (4 files total)
      await Promise.all([
        desktopImg.clone().webp({ quality: 85 }).toFile(path.join(destDir, `${filename}.webp`)),
        desktopImg.clone().avif({ quality: 80 }).toFile(path.join(destDir, `${filename}.avif`)),
        mobileImg.clone().webp({ quality: 85 }).toFile(path.join(destDir, `${filename}-mobile.webp`)),
        mobileImg.clone().avif({ quality: 80 }).toFile(path.join(destDir, `${filename}-mobile.avif`))
      ]);
      
      console.log(`✅ Optimized: ${entry.name}`);
    }
  } catch (error) {
    console.error(`Error processing directory ${srcDir}:`, error);
  }
}

async function run() {
  console.log(`Starting Omkara Image Optimization...`);
  console.log(`Input: ${inputDir}`);
  console.log(`Output: ${outputDir}`);
  
  try {
    await fs.stat(inputDir);
  } catch {
    console.log(`Input directory not found. Creating ${inputDir}...`);
    await fs.mkdir(inputDir, { recursive: true });
    console.log(`Please place images in ${inputDir} and run again.`);
    process.exit(0);
  }
  
  await processDirectory(inputDir, outputDir);
  console.log(`✨ All done!`);
}

run();
