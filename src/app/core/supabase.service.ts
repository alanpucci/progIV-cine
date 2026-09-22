import { Service } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { entorno } from '../../environments/environment';

@Service()
export class SupabaseService {
  readonly cliente: SupabaseClient = createClient(entorno.urlSupabase, entorno.claveAnonSupabase);
}
