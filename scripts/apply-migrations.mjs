import postgres from 'postgres';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL || DB_URL.includes('[YOUR-PASSWORD]')) {
  console.error('ERRO: SUPABASE_DB_URL não está configurada ou contém placeholder [YOUR-PASSWORD].');
  console.error('Edite .env.local e substitua [YOUR-PASSWORD] pela senha real do banco.');
  process.exit(1);
}

// Parser manual: a senha pode conter @ literal (confunde URL parser nativo).
// Regex greedy em (.+) captura senha até o ÚLTIMO @ (separador do host).
const m = DB_URL.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/]+)(?::(\d+))?\/(.+)$/);
if (!m) {
  console.error('ERRO: SUPABASE_DB_URL com formato inválido. Esperado: postgresql://user:pass@host:port/db');
  process.exit(1);
}
const [, user, password, host, portStr, database] = m;
const port = portStr ? Number(portStr) : 5432;

// Filtro opcional: argumento da CLI seleciona migration única (ex: npm run db:apply 20260529120100)
const filter = process.argv[2] ?? null;

console.log(`Conectando: user=${user}, host=${host}:${port}, db=${database}`);

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
let files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
if (filter) files = files.filter((f) => f.includes(filter));

console.log(`Migrations a aplicar: ${files.length > 0 ? files.join(', ') : '(nenhuma)'}`);

const sql = postgres({
  host, port, database, user, password,
  max: 1, ssl: 'require', prepare: false,
});

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

console.log(`\n✓ ${files.length} migration(s) aplicada(s).`);
await sql.end();
