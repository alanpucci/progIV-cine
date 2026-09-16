import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { entorno } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly cliente: SupabaseClient = createClient(entorno.urlSupabase, entorno.claveAnonSupabase);
}
