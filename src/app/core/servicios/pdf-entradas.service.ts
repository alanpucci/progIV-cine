import { Service } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { EntradaImprimible, FuncionEntrada } from '../modelos/entrada.model';
import { generarQr } from '../helpers/qr.helpers';
import { formatearClasificacion, formatearFechaFuncion, formatearHoraFuncion } from '../helpers/pelicula.formato';
import { normalizarTexto } from '../helpers/texto.helpers';

type Rgb = [number, number, number];

const ANCHO = 200;
const ALTO = 90;
const INICIO_TALON = 142;

const COLOR_NOCHE: Rgb = [11, 11, 18];
const COLOR_CREMA: Rgb = [243, 239, 230];
const COLOR_TELON: Rgb = [196, 40, 58];
const COLOR_MARQUESINA: Rgb = [212, 175, 55];
const COLOR_GRIS: Rgb = [111, 108, 133];

@Service()
export class PdfEntradasService {
  async descargar(funcion: FuncionEntrada, entradas: EntradaImprimible[]): Promise<void> {
    if (entradas.length === 0) return;
    const { jsPDF } = await import('jspdf');
    const documento = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [ALTO, ANCHO] });

    for (const [indice, entrada] of entradas.entries()) {
      if (indice > 0) documento.addPage([ALTO, ANCHO], 'landscape');
      this.dibujarEntrada(documento, funcion, entrada, await generarQr(entrada.codigoQr));
    }

    documento.setProperties({ title: `Entradas - ${funcion.peliculaNombre}` });
    documento.save(this.nombreArchivo(funcion));
  }

  private dibujarEntrada(documento: jsPDF, funcion: FuncionEntrada, entrada: EntradaImprimible, qr: string): void {
    documento.setFillColor(...COLOR_CREMA);
    documento.rect(0, 0, ANCHO, ALTO, 'F');

    documento.setFillColor(...COLOR_NOCHE);
    documento.rect(0, 0, INICIO_TALON, 16, 'F');
    documento.setFillColor(...COLOR_TELON);
    documento.rect(0, 16, INICIO_TALON, 1.5, 'F');

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(14);
    documento.setTextColor(...COLOR_CREMA);
    documento.text('CINE', 10, 10.5);
    documento.setTextColor(...COLOR_MARQUESINA);
    documento.text('PROGIV', 10 + documento.getTextWidth('CINE '), 10.5);
    documento.setFontSize(8);
    documento.setTextColor(...COLOR_CREMA);
    documento.text('ENTRADA', INICIO_TALON - 10, 10.5, { align: 'right', charSpace: 1 });

    documento.setTextColor(...COLOR_NOCHE);
    documento.setFontSize(18);
    const titulo = this.recortarLineas(documento.splitTextToSize(funcion.peliculaNombre.toUpperCase(), INICIO_TALON - 20), 2);
    documento.text(titulo, 10, 28);

    const inicioMeta = 28 + titulo.length * 7;
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.setTextColor(...COLOR_GRIS);
    const lineas = [
      `${funcion.salaNombre}  ·  ${this.limpiar(formatearFechaFuncion(funcion.inicio))}  ·  ${this.limpiar(formatearHoraFuncion(funcion.inicio))}`,
      `${funcion.tipoProyeccion}  ·  ${funcion.idioma === 'castellano' ? 'Castellano' : 'Subtitulada'}  ·  ${formatearClasificacion(funcion.clasificacionEdad)}`,
    ];
    documento.text(lineas, 10, inicioMeta, { lineHeightFactor: 1.5 });

    documento.setFontSize(7);
    documento.text('BUTACA', 10, ALTO - 22, { charSpace: 1 });
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(30);
    documento.setTextColor(...COLOR_TELON);
    documento.text(`${entrada.fila}${entrada.numero}`, 10, ALTO - 10);
    if (entrada.tipo !== 'normal') {
      const anchoButaca = documento.getTextWidth(`${entrada.fila}${entrada.numero}`);
      documento.setFontSize(9);
      documento.setTextColor(...COLOR_MARQUESINA);
      documento.text(entrada.tipo.toUpperCase(), 14 + anchoButaca, ALTO - 10, { charSpace: 1 });
    }

    if (funcion.clasificacionEdad !== null) {
      documento.setFont('helvetica', 'normal');
      documento.setFontSize(7);
      documento.setTextColor(...COLOR_GRIS);
      documento.text('Se pide documento en el ingreso.', INICIO_TALON - 10, ALTO - 10, { align: 'right' });
    }

    documento.setDrawColor(...COLOR_GRIS);
    documento.setLineWidth(0.3);
    documento.setLineDashPattern([1.5, 1.5], 0);
    documento.line(INICIO_TALON, 0, INICIO_TALON, ALTO);
    documento.setLineDashPattern([], 0);

    const centroTalon = (INICIO_TALON + ANCHO) / 2;
    const ladoQr = 44;
    documento.addImage(qr, 'PNG', centroTalon - ladoQr / 2, 10, ladoQr, ladoQr);

    documento.setFont('courier', 'bold');
    documento.setFontSize(8);
    documento.setTextColor(...COLOR_NOCHE);
    const grupos = entrada.codigoQr.match(/.{1,4}/g) ?? [entrada.codigoQr];
    documento.text([grupos.slice(0, 4).join(' '), grupos.slice(4).join(' ')], centroTalon, 62, {
      align: 'center',
      lineHeightFactor: 1.4,
    });

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(6.5);
    documento.setTextColor(...COLOR_GRIS);
    documento.text('Presentá este QR en el ingreso a la sala.', centroTalon, ALTO - 10, { align: 'center' });
  }

  private recortarLineas(lineas: string[], maximo: number): string[] {
    if (lineas.length <= maximo) return lineas;
    const recortadas = lineas.slice(0, maximo);
    recortadas[maximo - 1] = `${recortadas[maximo - 1].replace(/\s*\S*$/, '')}...`;
    return recortadas;
  }

  private nombreArchivo(funcion: FuncionEntrada): string {
    const pelicula = normalizarTexto(funcion.peliculaNombre).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `entradas-${pelicula}-${funcion.inicio.slice(0, 10)}.pdf`;
  }

  private limpiar(texto: string): string {
    return texto.replace(/\s/g, ' ');
  }
}
