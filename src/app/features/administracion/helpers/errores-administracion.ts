import { PostgrestError } from '@supabase/supabase-js';

export function mensajeDeError(error: unknown, mensajeGenerico: string): string {
  return error instanceof Error && !(error instanceof PostgrestError) ? error.message : mensajeGenerico;
}
