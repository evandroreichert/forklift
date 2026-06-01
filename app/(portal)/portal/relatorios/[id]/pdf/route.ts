import React from 'react';
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { RelatorioPDF } from '@/lib/pdf/RelatorioPDF';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await requireProfile();
  const supabase = await createClient();

  // RLS já filtra: admin vê tudo, mecânico só os seus, cliente só approved da própria company
  const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
  if (!report) return new NextResponse('Relatório não encontrado', { status: 404 });
  if (report.status !== 'approved')
    return new NextResponse('Só relatórios aprovados podem virar PDF', { status: 403 });

  const { data: intervals } = await supabase
    .from('report_intervals')
    .select('*')
    .eq('report_id', id)
    .order('ordem', { ascending: true });

  let signatureDataUrl: string | null = null;
  if (report.assinatura_path) {
    try {
      const adminCli = createAdminClient();
      const { data: blob } = await adminCli.storage
        .from('signatures')
        .download(report.assinatura_path);
      if (blob) {
        const buf = Buffer.from(await blob.arrayBuffer());
        signatureDataUrl = `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch (err) {
      console.error('[pdf] falha ao baixar assinatura:', err);
    }
  }

  // logo2.png = logo específica do PDF do relatório (não a do site)
  const logoBuf = await readFile(path.join(process.cwd(), 'public', 'logo2.png'));
  const logoDataUrl = `data:image/png;base64,${logoBuf.toString('base64')}`;

  // RelatorioPDF retorna um <Document> internamente — o tipo do wrapper
  // não bate exatamente com DocumentProps esperado por renderToBuffer.
  const element = React.createElement(RelatorioPDF, {
    report,
    intervals: intervals ?? [],
    signatureDataUrl,
    logoDataUrl,
  });
  const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  const filename = `Relatorio-${report.numero ?? id}.pdf`;
  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-cache',
    },
  });
}
