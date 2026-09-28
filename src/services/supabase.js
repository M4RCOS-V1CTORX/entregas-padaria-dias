import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oafoizwjiknsaxtlasvf.supabase.co'
const supabaseKey = 'sb_publishable_gztO350O3KCOQB0CcuoQxw_qRb8MLtV'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)