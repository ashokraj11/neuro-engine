import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export const compileVideo = async (scenes: { imageUrl?: string; audioUrl?: string }[]) => {
  const ffmpeg = await loadFFmpeg();
  
  // Write files to FFmpeg's virtual file system
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (scene.imageUrl) {
      await ffmpeg.writeFile(`image${i}.png`, await fetchFile(scene.imageUrl));
    }
    if (scene.audioUrl) {
      await ffmpeg.writeFile(`audio${i}.mp3`, await fetchFile(scene.audioUrl));
    }
  }

  // Create a list file for concat demuxer
  let concatContent = '';
  for (let i = 0; i < scenes.length; i++) {
    concatContent += `file 'image${i}.png'\n`;
    concatContent += `duration 5\n`; // Default 5 seconds per scene
    concatContent += `file 'image${i}.png'\n`; // Needed for concat demuxer
  }
  await ffmpeg.writeFile('concat.txt', concatContent);

  // Run FFmpeg command
  // This is a simplified command; real video compilation needs more complex filtering
  await ffmpeg.exec([
    '-f', 'concat', '-safe', '0', '-i', 'concat.txt',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};
