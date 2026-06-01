# Compartilhar relatório no WhatsApp (PDF anexado)

**Data:** 2026-06-01
**Escopo:** Adicionar ação "Compartilhar no WhatsApp" no relatório aprovado, ao lado do botão "Baixar PDF" existente, para os perfis **admin** e **mecânico**.

## Motivação

Hoje quem precisa enviar o relatório pro cliente baixa o PDF e anexa manualmente no WhatsApp. O cliente final raramente tem login no portal, então o link interno (`/portal/relatorios/[id]/pdf`) não serve. Queremos um fluxo onde o técnico/admin, em 2 toques no celular, dispara o WhatsApp com o PDF já anexado.

## Decisão de arquitetura

**Client-side, sem nova rota e sem URL pública.** Reaproveita a rota autenticada `/portal/relatorios/[id]/pdf` que já gera o PDF via `@react-pdf/renderer`. O navegador busca o PDF, envolve em `File` e entrega à **Web Share API** (`navigator.share`) com `files`.

Isso evita:

- Criar signed URL pública (mudaria storage/RLS)
- Expor identificadores de relatório fora do portal
- Backend novo só pra share

## Escopo (perfis)

- ✅ `app/(portal)/portal/admin/relatorios/[id]/AdminEditarForm.tsx` — botão Compartilhar dentro do mesmo grupo do "Baixar PDF" no header do form (linhas ~181-192). É client component, então recebe `ShareReportButton` direto.
- ✅ `app/(portal)/portal/mecanico/relatorios/[id]/page.tsx` — botão Compartilhar no header, ao lado do "Baixar PDF" existente (linhas ~61-72). É server component; o `ShareReportButton` (client) é importado e renderizado como filho.
- ❌ `app/(portal)/portal/cliente/relatorios/[id]/page.tsx` — **não recebe** o botão (cliente já está com o relatório, não precisa repassar)
- ❌ `components/portal/ReportsList.tsx` — fora de escopo nesta fatia (manter só ícone de download na lista)

Restrição: só aparece quando `report.status === 'approved'` (mesma regra do "Baixar PDF").

## Componente novo

`components/portal/ShareReportButton.tsx` — **client component**.

Props:

```ts
type Props = {
  reportId: string;
  maquinaIdentificador: string | null;
  className?: string;
};
```

Comportamento ao clicar:

1. `setLoading(true)`
2. `fetch('/portal/relatorios/${reportId}/pdf')` → `blob` → `new File([blob], 'relatorio-${reportId}.pdf', { type: 'application/pdf' })`
3. Monta `shareData`:

   ```ts
   const text = `Segue relatório de manutenção da máquina ${maquinaIdentificador || '—'} — FB Empilhadeiras`;
   const shareData = { files: [pdfFile], title: 'Relatório FB Empilhadeiras', text };
   ```

4. **Caminho principal** (mobile + Chrome desktop suportado):
   - Se `navigator.canShare?.(shareData)` → `await navigator.share(shareData)`
   - Bandeja nativa abre, usuário escolhe WhatsApp, PDF vai anexado.
5. **Fallback** (Safari desktop, Firefox, navegador sem suporte a files):
   - Dispara download do PDF via `<a href={blobUrl} download>` programaticamente
   - Em seguida, abre `https://wa.me/?text=${encodeURIComponent(text + ' (PDF baixado, anexe na conversa)')}` em nova aba (`window.open(url, '_blank', 'noopener,noreferrer')`)
6. `finally { setLoading(false) }`. Em erro de rede ou `AbortError` (usuário cancelou o share), só registra e volta ao estado normal — sem toast de erro, exceto se for falha real de fetch.

Estado visual:

- Idle: ícone `Share2` (lucide) + texto "Compartilhar"
- Loading: spinner ou `disabled` com texto "Preparando…"
- Estilo: secundário ao "Baixar PDF" — borda branca, sem fundo amarelo (para não competir com a CTA principal de baixar)

## Mudanças nas páginas

**Mecânico** (`mecanico/relatorios/[id]/page.tsx`) — server component, já tem o `<div className="flex flex-wrap items-center gap-2">` no header. Adicionar `<ShareReportButton ... />` antes do `<a>Baixar PDF</a>` quando `report.status === 'approved'`.

**Admin** (`admin/relatorios/[id]/AdminEditarForm.tsx`) — client component. No mesmo grupo onde mora o "Baixar PDF" (linhas ~181-192), adicionar `<ShareReportButton ... />` antes do anchor, também só quando `report.status === 'approved'`. Como o form pode estar com mudanças não salvas, usar o valor do estado do form pra `maquinaIdentificador` (ex.: `form.maquina_identificador`) — o PDF servido pela rota usa o que está persistido, então pode haver discrepância textual com o estado do form; aceitar essa pequena divergência (admin tipicamente compartilha depois de salvar/aprovar).

Não é necessário mexer no layout flex — os containers já comportam mais um item.

## Por que isso é seguro

- A rota `/portal/relatorios/[id]/pdf` continua autenticada — o `fetch` envia cookies do portal e o RLS continua valendo. Se um admin/mecânico não pode ver, o fetch falha 403 antes de qualquer share.
- O `File` gerado fica em memória do navegador do técnico. Só sai dali se ele escolher um app no share sheet.
- Não há novo endpoint, nova permissão, nem novo storage.

## Compatibilidade (referência)

| Navegador | Web Share + files | Comportamento |
|---|---|---|
| Chrome/Edge Android | ✅ | Bandeja nativa → WhatsApp |
| Safari iOS 15+ | ✅ | Bandeja nativa → WhatsApp |
| Chrome desktop | ✅ (perfil logado em conta Google) | Share sheet do Chrome |
| Firefox / Safari desktop | ❌ | Cai no fallback (download + wa.me) |

Estratégia conservadora: confiamos no `canShare`. Se a API não está lá ou retorna `false`, fallback assume.

## Testes manuais (golden path)

1. Mecânico abre relatório aprovado no Chrome Android → toca Compartilhar → escolhe WhatsApp → contato → PDF chega anexado, mensagem preenchida com `Segue relatório de manutenção da máquina <id> — FB Empilhadeiras`.
2. Admin no desktop Firefox → clica Compartilhar → PDF baixa + aba do WhatsApp Web abre com a mensagem (sem anexo automático, anexa manualmente).
3. Cliente: não vê o botão (continua só com "Baixar PDF").
4. Relatório `pending_approval`: botão não aparece em nenhum perfil.

## Fora de escopo (YAGNI)

- Botão na lista de relatórios (`ReportsList.tsx`)
- Compartilhar para outros apps específicos (Telegram, email com anexo)
- Pré-selecionar contato/grupo (a Web Share API não permite escolher app específico)
- Cache do PDF entre share e download
- Tracking/analytics de "quem compartilhou com quem"
