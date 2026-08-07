import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rsvabjvufeijlblgblxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmFianZ1ZmVpamxibGdibHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDE3MTEsImV4cCI6MjEwMTY3NzcxMX0.0yE0btVcNJu5U90kkhm5WnkjPl8M92PqHBMJqaNQ96E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);