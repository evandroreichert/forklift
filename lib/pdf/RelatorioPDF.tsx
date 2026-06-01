import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { Report, ReportInterval } from '@/lib/reports/types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2pt solid #000',
    paddingBottom: 14,
    marginBottom: 16,
  },
  logoBox: { width: 130 },
  logo: { width: 130, objectFit: 'contain' },
  cnpj: { marginTop: 8, fontSize: 8, color: '#555' },
  headerRight: { textAlign: 'right', maxWidth: 260 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  numero: { color: '#bfa600', fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  subTitle: { marginTop: 6, fontSize: 10 },
  meta: { fontSize: 8, color: '#666', marginTop: 4 },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    color: '#FFD500',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  twoCol: { flexDirection: 'row' },
  col: { flex: 1, paddingRight: 12 },
  label: { color: '#666', fontSize: 8, marginBottom: 2 },
  value: { fontSize: 10, marginBottom: 8 },
  intervalBox: {
    border: '1pt solid #ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  intervalTitle: {
    color: '#bfa600',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  obs: { fontSize: 10, lineHeight: 1.6 },
  signatureLabel: { fontSize: 8, color: '#666', marginTop: 12 },
  signatureImg: {
    width: 220,
    height: 80,
    marginTop: 4,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    borderTop: '1pt solid #eee',
    paddingTop: 6,
  },
});

type Props = {
  report: Report;
  intervals: ReportInterval[];
  signatureDataUrl: string | null;
  logoDataUrl: string;
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export function RelatorioPDF({ report, intervals, signatureDataUrl, logoDataUrl }: Props) {
  const tipos: string[] = [];
  if (report.is_preventiva) tipos.push('Preventiva');
  if (report.is_corretiva) tipos.push('Corretiva');

  return (
    <Document
      title={`Relatório ${report.numero ?? ''} — ${report.cliente_nome}`}
      author="FB Empilhadeiras"
      creator="Portal Fabiano Bratti Empilhadeiras"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.logoBox}>
            <Image style={styles.logo} src={logoDataUrl} />
            <Text style={styles.cnpj}>CNPJ: 50.982.211/0001-45</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>ASSISTÊNCIA TÉCNICA</Text>
            {report.numero != null && <Text style={styles.numero}>#{report.numero}</Text>}
            <Text style={styles.subTitle}>{report.titulo || '—'}</Text>
            <Text style={styles.meta}>Emitido em: {fmtDate(report.approved_at)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>CLIENTE & MÁQUINA</Text>
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{report.cliente_nome}</Text>
            <Text style={styles.label}>Identificador da máquina</Text>
            <Text style={styles.value}>{report.maquina_identificador}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Horímetro</Text>
            <Text style={styles.value}>{String(report.horimetro)}</Text>
            <Text style={styles.label}>Tipo de atividade</Text>
            <Text style={styles.value}>{tipos.join(' & ') || '—'}</Text>
            <Text style={styles.label}>Máquina parada</Text>
            <Text style={styles.value}>{report.maquina_parada ? 'Sim' : 'Não'}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>INTERVALOS DA ATIVIDADE</Text>
        {intervals.length === 0 && <Text style={styles.value}>Nenhum.</Text>}
        {intervals.map((iv) => (
          <View key={iv.id} style={styles.intervalBox}>
            <Text style={styles.intervalTitle}>DIA {String(iv.ordem).padStart(2, '0')}</Text>
            <Text>Início: {fmtDate(iv.inicio)}</Text>
            <Text>Fim: {fmtDate(iv.fim)}</Text>
          </View>
        ))}

        <Text style={styles.sectionHeader}>OBSERVAÇÕES DO SERVIÇO</Text>
        <Text style={styles.obs}>{report.sumario_defeitos || '—'}</Text>

        <Text style={styles.sectionHeader}>RESPONSÁVEL</Text>
        <Text style={styles.value}>{report.responsavel_nome ?? '—'}</Text>
        {signatureDataUrl && (
          <View>
            <Text style={styles.signatureLabel}>Assinatura:</Text>
            <Image style={styles.signatureImg} src={signatureDataUrl} />
          </View>
        )}

        <Text style={styles.footer} fixed>
          FB Empilhadeiras · FABIANO BRATTI E CIA LTDA · CNPJ 50.982.211/0001-45
        </Text>
      </Page>
    </Document>
  );
}
