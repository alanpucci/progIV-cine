// Genera src/environments/environment.ts a partir de variables de entorno
// (SUPABASE_URL / SUPABASE_ANON_KEY), tomadas de .env en local o de las
// variables configuradas en el proyecto de Vercel en despliegue. El archivo
// generado no se commitea (ver .gitignore) para no subir credenciales.
const fs = require('node:fs');
const path = require('node:path');

const rutaEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(rutaEnv)) {
  process.loadEnvFile(rutaEnv);
}

const urlSupabase = process.env.SUPABASE_URL;
const claveAnonSupabase = process.env.SUPABASE_ANON_KEY;

if (!urlSupabase || !claveAnonSupabase) {
  console.error(
    'Faltan SUPABASE_URL y/o SUPABASE_ANON_KEY.\n' +
      'Copiá .env.example a .env y completá los valores de tu proyecto de Supabase\n' +
      '(o configuralas como variables de entorno en Vercel).',
  );
  process.exit(1);
}

const contenido = `export const entorno = {
  urlSupabase: '${urlSupabase}',
  claveAnonSupabase: '${claveAnonSupabase}',
};
`;

const carpetaDestino = path.join(__dirname, '..', 'src', 'environments');
fs.mkdirSync(carpetaDestino, { recursive: true });
fs.writeFileSync(path.join(carpetaDestino, 'environment.ts'), contenido);

console.log('src/environments/environment.ts generado a partir de variables de entorno.');
