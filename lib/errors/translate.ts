// Traduz erros conhecidos (Supabase Postgres, Supabase Auth, Resend, Storage)
// pra português brasileiro. Pra erros desconhecidos, retorna uma mensagem
// genérica e loga o detalhe técnico no console pro dev investigar.

type LooseError = {
  message?: string;
  code?: string;
  name?: string;
} | null | undefined;

const PATTERNS: { match: RegExp | string; pt: string }[] = [
  // Supabase Postgres / PostgREST
  { match: /duplicate key value violates unique constraint/i, pt: 'Já existe um registro com esses dados.' },
  { match: /violates row-level security policy/i, pt: 'Sem permissão para executar esta operação.' },
  { match: /new row violates row-level security policy/i, pt: 'Sem permissão para executar esta operação.' },
  { match: /violates foreign key constraint/i, pt: 'Referência inválida (registro relacionado não existe).' },
  { match: /violates not-null constraint/i, pt: 'Campo obrigatório não preenchido.' },
  { match: /violates check constraint "tipo_atividade_pelo_menos_um"/i, pt: 'Marque pelo menos um tipo (preventiva ou corretiva).' },
  { match: /violates check constraint "fim_after_inicio"/i, pt: 'O horário de fim precisa ser igual ou posterior ao início.' },
  { match: /violates check constraint "numero_assigned_when_approved"/i, pt: 'Numeração do relatório só pode ser atribuída quando aprovado.' },
  { match: /violates check constraint/i, pt: 'Dados inválidos. Revise os campos preenchidos.' },
  { match: /JSON object requested, multiple \(or no\) rows returned/i, pt: 'Registro não encontrado.' },
  { match: /relation .* does not exist/i, pt: 'Recurso indisponível no momento.' },

  // Supabase Auth
  { match: /invalid login credentials/i, pt: 'Email ou senha inválidos.' },
  { match: /email not confirmed/i, pt: 'Email ainda não foi confirmado.' },
  { match: /user already registered/i, pt: 'Já existe um usuário com esse email.' },
  { match: /email rate limit exceeded/i, pt: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  { match: /signups not allowed/i, pt: 'Cadastro de novos usuários desativado.' },
  { match: /password should be at least/i, pt: 'A senha precisa ter pelo menos 6 caracteres.' },
  { match: /user not found/i, pt: 'Usuário não encontrado.' },

  // Supabase Storage
  { match: /the resource was not found/i, pt: 'Arquivo não encontrado.' },
  { match: /payload too large/i, pt: 'Arquivo excede o tamanho permitido.' },
  { match: /mime type .* is not supported/i, pt: 'Tipo de arquivo não suportado.' },

  // Resend
  { match: /^Resend error:/i, pt: 'Falha ao enviar email.' },
  { match: /domain is not verified/i, pt: 'Domínio de email não verificado no Resend.' },

  // Rede / timeout
  { match: /fetch failed/i, pt: 'Falha de conexão. Tente novamente em instantes.' },
  { match: /network error/i, pt: 'Falha de conexão. Tente novamente em instantes.' },
];

const GENERIC = 'Algo deu errado. Tente novamente em instantes.';

export function translateError(err: LooseError | string | unknown): string {
  if (!err) return GENERIC;

  let raw: string;
  if (typeof err === 'string') {
    raw = err;
  } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as LooseError)?.message === 'string') {
    raw = (err as { message: string }).message;
  } else {
    console.error('[translateError] erro desconhecido:', err);
    return GENERIC;
  }

  for (const p of PATTERNS) {
    if (typeof p.match === 'string') {
      if (raw.includes(p.match)) return p.pt;
    } else if (p.match.test(raw)) {
      return p.pt;
    }
  }

  console.error('[translateError] sem tradução:', raw);
  return GENERIC;
}
