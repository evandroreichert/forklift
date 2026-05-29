// Cria o user admin inicial (Fabiano) no projeto Supabase remoto.
// Idempotente: se já existe, só garante que tem profile com role=admin.
//
// Uso: npm run db:bootstrap
//
// Edite EMAIL/SENHA/NOME antes de rodar pela 1ª vez.

import { createClient } from '@supabase/supabase-js';

const EMAIL = 'fabiano@fb.com.br';
const SENHA = 'Forklift2026'; // CHANGE ME se quiser
const NOME = 'Fabiano Bratti';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Tenta criar; se já existir, pega o user existente
let userId;
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: SENHA,
  email_confirm: true,
});

if (createErr) {
  if (createErr.message.toLowerCase().includes('already')) {
    console.log(`User ${EMAIL} já existe, buscando UUID...`);
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === EMAIL);
    if (!existing) {
      console.error('ERRO: createUser disse que existe mas listUsers não achou.');
      process.exit(1);
    }
    userId = existing.id;
  } else {
    console.error('Erro criando user:', createErr.message);
    process.exit(1);
  }
} else {
  userId = created.user.id;
  console.log(`User ${EMAIL} criado: ${userId}`);
}

// Upsert do profile
const { error: profErr } = await supabase.from('profiles').upsert({
  id: userId,
  full_name: NOME,
  role: 'admin',
  active: true,
});

if (profErr) {
  console.error('Erro upsert profile:', profErr.message);
  process.exit(1);
}

console.log(`✓ Profile admin pronto. Login: ${EMAIL} / ${SENHA}`);
