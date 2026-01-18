import fs from 'fs';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'sqlite.db');

  if (!fs.existsSync(dbPath)) {
    return new Response('Database not found', { status: 404 });
  }

  const file = fs.readFileSync(dbPath);

  return new Response(file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="backup.db"',
    },
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const dbPath = path.join(process.cwd(), 'sqlite.db');

  // Backup current db before replacing
  if (fs.existsSync(dbPath)) {
    const backupPath = path.join(process.cwd(), 'sqlite.db.backup');
    fs.copyFileSync(dbPath, backupPath);
  }

  fs.writeFileSync(dbPath, Buffer.from(buffer));

  return new Response('Database restored successfully');
}