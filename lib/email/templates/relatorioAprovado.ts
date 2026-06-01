type Args = {
  reportId: string;
  numero: number;
  titulo: string;
  clienteNome: string;
  siteUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function relatorioAprovadoEmail(args: Args): { subject: string; html: string } {
  const link = `${args.siteUrl}/portal/mecanico/relatorios/${args.reportId}`;
  const subject = `[FB] Relatório #${args.numero} aprovado — ${args.clienteNome}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#0a0a0a;font-family:Arial,sans-serif;color:#fff">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#171717;border-radius:12px;padding:32px">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:20px;color:#10b981">Relatório aprovado · #${args.numero}</h1>
        <p style="margin:0 0 8px;color:#d4d4d4">Título: <strong style="color:#fff">${escapeHtml(args.titulo)}</strong></p>
        <p style="margin:0 0 8px;color:#d4d4d4">Cliente: <strong style="color:#fff">${escapeHtml(args.clienteNome)}</strong></p>
        <p style="margin:24px 0 0">
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#FFD500;color:#000;text-decoration:none;border-radius:8px;font-weight:bold">Ver relatório</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
