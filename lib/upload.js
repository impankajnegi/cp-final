import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function saveFile(file, folder = 'uploads') {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, '-')}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);
    return `/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function saveMultipleFiles(files, folder = 'uploads') {
  const filePaths = [];
  for (const file of files) {
    const path = await saveFile(file, folder);
    filePaths.push(path);
  }
  return filePaths;
}
