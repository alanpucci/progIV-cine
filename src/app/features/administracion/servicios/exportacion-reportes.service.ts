import { Service } from '@angular/core';
import type { jsPDF } from 'jspdf';
import type { CellObject, Sheet } from 'write-excel-file/browser';
import { formatearFechaMovimiento } from '../../../core/helpers/movimiento.formato';
import { CeldaTabla, ColumnaTabla, FormatoColumna, Reporte, TablaReporte } from '../modelos/reporte-administracion.model';
import { formatearPeriodo } from '../helpers/periodo-reporte.helpers';
import { formatearCelda, tablasDelReporte } from '../helpers/tablas-reporte.helpers';

type Rgb = [number, number, number];
type HojaExcel = Sheet<File | Blob | ArrayBuffer>;

const ANCHO = 210;
const ALTO = 297;
const MARGEN = 14;
const ALTO_FILA = 6.5;

const COLOR_NOCHE: Rgb = [11, 11, 18];
const COLOR_CREMA: Rgb = [243, 239, 230];
const COLOR_RENGLON: Rgb = [232, 227, 214];
const COLOR_TELON: Rgb = [196, 40, 58];
const COLOR_MARQUESINA: Rgb = [212, 175, 55];
const COLOR_GRIS: Rgb = [111, 108, 133];

const FORMATO_EXCEL: Record<FormatoColumna, string | undefined> = {
  texto: undefined,
  entero: '#,##0',
  pesos: '"$"#,##0.00',
};

@Service()
export class ExportacionReportesService {
  async descargarPdf(reporte: Reporte): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const documento = new jsPDF({ unit: 'mm', format: 'a4' });

    let y = this.dibujarEncabezado(documento, reporte);
    for (const tabla of tablasDelReporte(reporte)) {
      y = this.dibujarTabla(documento, tabla, y);
    }
    this.dibujarPies(documento);

    documento.setProperties({ title: `Reporte de ventas - ${this.limpiar(formatearPeriodo(reporte.periodo))}` });
    documento.save(`${this.nombreArchivo(reporte)}.pdf`);
  }

  async descargarExcel(reporte: Reporte): Promise<void> {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const { totales } = reporte;

    const resumen: HojaExcel = {
      sheet: 'Resumen',
      columns: [{ width: 22 }, { width: 40 }],
      data: [
        [{ value: 'Reporte de ventas', fontWeight: 'bold' }, null],
        ['Período', formatearPeriodo(reporte.periodo)],
        ['Ventas pagadas', this.celdaExcel(totales.ventas, 'entero')],
        ['Entradas vendidas', this.celdaExcel(totales.entradas, 'entero')],
        ['Descuentos', this.celdaExcel(totales.descuentos, 'pesos')],
        ['Facturado', { ...this.celdaExcel(totales.facturado, 'pesos'), fontWeight: 'bold' }],
      ],
    };

    const hojas: HojaExcel[] = tablasDelReporte(reporte).map((tabla) => ({
      sheet: tabla.hoja,
      columns: tabla.columnas.map((columna) => ({ width: columna.ancho })),
      stickyRowsCount: 1,
      data: [
        tabla.columnas.map((columna) => ({ value: columna.titulo, fontWeight: 'bold' as const })),
        ...tabla.filas.map((fila) => this.filaExcel(fila, tabla.columnas, false)),
        ...(tabla.total ? [this.filaExcel(tabla.total, tabla.columnas, true)] : []),
      ],
    }));

    await writeXlsxFile([resumen, ...hojas]).toFile(`${this.nombreArchivo(reporte)}.xlsx`);
  }

  private filaExcel(fila: CeldaTabla[], columnas: ColumnaTabla[], destacada: boolean): CellObject[] {
    return fila.map((celda, indice) => ({
      ...this.celdaExcel(celda, columnas[indice].formato),
      ...(destacada ? { fontWeight: 'bold' as const } : {}),
    }));
  }

  private celdaExcel(celda: CeldaTabla, formato: FormatoColumna): CellObject {
    const tipoFormato = typeof celda === 'number' ? FORMATO_EXCEL[formato] : undefined;
    return tipoFormato ? { value: celda, format: tipoFormato } : { value: celda };
  }

  private dibujarEncabezado(documento: jsPDF, reporte: Reporte): number {
    documento.setFillColor(...COLOR_NOCHE);
    documento.rect(0, 0, ANCHO, 22, 'F');
    documento.setFillColor(...COLOR_TELON);
    documento.rect(0, 22, ANCHO, 1.5, 'F');

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(16);
    documento.setTextColor(...COLOR_CREMA);
    documento.text('CINE', MARGEN, 14);
    documento.setTextColor(...COLOR_MARQUESINA);
    documento.text('PROGIV', MARGEN + documento.getTextWidth('CINE '), 14);
    documento.setFontSize(8);
    documento.setTextColor(...COLOR_CREMA);
    const rotulo = 'REPORTE DE VENTAS';
    const anchoRotulo = documento.getTextWidth(rotulo) + (rotulo.length - 1);
    documento.text(rotulo, ANCHO - MARGEN - anchoRotulo, 14, { charSpace: 1 });

    documento.setTextColor(...COLOR_NOCHE);
    documento.setFontSize(14);
    documento.text(this.limpiar(formatearPeriodo(reporte.periodo)), MARGEN, 34);

    const { totales } = reporte;
    const indicadores: [string, string][] = [
      ['FACTURADO', formatearCelda(totales.facturado, 'pesos')],
      ['VENTAS', formatearCelda(totales.ventas, 'entero')],
      ['ENTRADAS', formatearCelda(totales.entradas, 'entero')],
      ['DESCUENTOS', formatearCelda(totales.descuentos, 'pesos')],
    ];
    const anchoIndicador = (ANCHO - MARGEN * 2 - 6) / indicadores.length;
    indicadores.forEach(([etiqueta, valor], indice) => {
      const x = MARGEN + indice * (anchoIndicador + 2);
      documento.setFillColor(...COLOR_RENGLON);
      documento.rect(x, 40, anchoIndicador, 16, 'F');
      documento.setFont('helvetica', 'normal');
      documento.setFontSize(7);
      documento.setTextColor(...COLOR_GRIS);
      documento.text(etiqueta, x + 3, 45.5, { charSpace: 0.8 });
      documento.setFont('helvetica', 'bold');
      documento.setFontSize(12);
      documento.setTextColor(...(indice === 0 ? COLOR_TELON : COLOR_NOCHE));
      documento.text(this.limpiar(valor), x + 3, 52.5);
    });

    return 66;
  }

  private dibujarTabla(documento: jsPDF, tabla: TablaReporte, inicio: number): number {
    let y = inicio;
    if (y + ALTO_FILA * 3 > ALTO - MARGEN) y = this.nuevaPagina(documento);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(11);
    documento.setTextColor(...COLOR_NOCHE);
    documento.text(tabla.titulo.toUpperCase(), MARGEN, y, { charSpace: 0.5 });
    y += 3;

    const anchoTotal = tabla.columnas.reduce((suma, columna) => suma + columna.ancho, 0);
    const anchos = tabla.columnas.map((columna) => (columna.ancho / anchoTotal) * (ANCHO - MARGEN * 2));

    y = this.dibujarFila(documento, tabla.columnas.map((columna) => columna.titulo), tabla.columnas, anchos, y, 'cabecera');

    if (tabla.filas.length === 0) {
      documento.setFont('helvetica', 'normal');
      documento.setFontSize(8.5);
      documento.setTextColor(...COLOR_GRIS);
      documento.text('Sin datos en el período.', MARGEN + 2, y + 4.5);
      return y + ALTO_FILA + 10;
    }

    tabla.filas.forEach((fila, indice) => {
      if (y + ALTO_FILA > ALTO - MARGEN) {
        y = this.nuevaPagina(documento);
        y = this.dibujarFila(documento, tabla.columnas.map((columna) => columna.titulo), tabla.columnas, anchos, y, 'cabecera');
      }
      y = this.dibujarFila(documento, fila, tabla.columnas, anchos, y, indice % 2 === 0 ? 'par' : 'impar');
    });

    if (tabla.total) {
      if (y + ALTO_FILA > ALTO - MARGEN) y = this.nuevaPagina(documento);
      y = this.dibujarFila(documento, tabla.total, tabla.columnas, anchos, y, 'total');
    }

    return y + 10;
  }

  private dibujarFila(
    documento: jsPDF,
    celdas: CeldaTabla[],
    columnas: ColumnaTabla[],
    anchos: number[],
    y: number,
    estilo: 'cabecera' | 'par' | 'impar' | 'total',
  ): number {
    if (estilo !== 'impar') {
      documento.setFillColor(...(estilo === 'cabecera' ? COLOR_NOCHE : estilo === 'total' ? COLOR_RENGLON : COLOR_CREMA));
      documento.rect(MARGEN, y, ANCHO - MARGEN * 2, ALTO_FILA, 'F');
    }

    documento.setFont('helvetica', estilo === 'cabecera' || estilo === 'total' ? 'bold' : 'normal');
    documento.setFontSize(estilo === 'cabecera' ? 7.5 : 8.5);
    documento.setTextColor(...(estilo === 'cabecera' ? COLOR_CREMA : COLOR_NOCHE));

    let x = MARGEN;
    celdas.forEach((celda, indice) => {
      const columna = columnas[indice];
      const texto = this.ajustar(documento, this.limpiar(estilo === 'cabecera' ? String(celda) : formatearCelda(celda, columna.formato)), anchos[indice] - 4);
      if (columna.formato === 'texto') {
        documento.text(texto, x + 2, y + 4.4);
      } else {
        documento.text(texto, x + anchos[indice] - 2, y + 4.4, { align: 'right' });
      }
      x += anchos[indice];
    });

    return y + ALTO_FILA;
  }

  private dibujarPies(documento: jsPDF): void {
    const paginas = documento.getNumberOfPages();
    const generado = this.limpiar(formatearFechaMovimiento(new Date().toISOString()));
    for (let pagina = 1; pagina <= paginas; pagina++) {
      documento.setPage(pagina);
      documento.setFont('helvetica', 'normal');
      documento.setFontSize(7);
      documento.setTextColor(...COLOR_GRIS);
      documento.text(`Generado el ${generado}`, MARGEN, ALTO - 7);
      documento.text(`Página ${pagina} de ${paginas}`, ANCHO - MARGEN, ALTO - 7, { align: 'right' });
    }
  }

  private nuevaPagina(documento: jsPDF): number {
    documento.addPage('a4');
    return MARGEN;
  }

  private ajustar(documento: jsPDF, texto: string, ancho: number): string {
    if (documento.getTextWidth(texto) <= ancho) return texto;
    let recortado = texto;
    while (recortado.length > 1 && documento.getTextWidth(`${recortado}...`) > ancho) {
      recortado = recortado.slice(0, -1);
    }
    return `${recortado.trimEnd()}...`;
  }

  private nombreArchivo(reporte: Reporte): string {
    return `reporte-ventas-${reporte.periodo.desde}_${reporte.periodo.hasta}`;
  }

  private limpiar(texto: string): string {
    return texto.replace(/\s/g, ' ');
  }
}
