import { toDataURL } from 'qrcode';

const COLOR_MODULOS = '#0b0b12';
const COLOR_FONDO = '#f3efe6';

export function generarQr(codigo: string): Promise<string> {
  return toDataURL(codigo, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: COLOR_MODULOS, light: COLOR_FONDO },
  });
}
