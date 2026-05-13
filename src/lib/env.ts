type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: PublicEnv = {
  supabaseUrl: requireEnv(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv(import.meta.env.VITE_SUPABASE_ANON_KEY, 'VITE_SUPABASE_ANON_KEY'),
};
