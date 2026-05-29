import postgres from 'postgres';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL || DB_URL.includes('[YOUR-PASSWORD]')) {
  console.error('ERRO: SUPABASE_DB_URL não está configurada ou contém placeholder [YOUR-PASSWORD].');
  console.error('Edite .env.local e substitua [YOUR-PASSWORD] pela senha real do banco.');
  process.exit(1);
}

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

console.log(`Encontradas ${files.length} migration(s):`, files);

const sql = postgres(DB_URL, { max: 1 });

for (const file of files) {
  const path = join(migrationsDir, file);
  const content = readFileSync(path, 'utf-8');
  console.log(`\n→ Aplicando ${file}...`);
  try {
    await sql.unsafe(content);
    console.log(`✓ ${file} aplicada com sucesso.`);
  } catch (e) {
    console.error(`✗ FALHA em ${file}:`, e.message);
    await sql.end();
    process.exit(1);
  }
}

console.log('\n✓ Todas as migrations aplicadas.');
await sql.end();
