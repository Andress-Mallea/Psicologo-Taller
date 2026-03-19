import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://cxzxndpnvsflttdipmjc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4enhuZHBudnNmbHR0ZGlwbWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTYxNDYsImV4cCI6MjA4ODM5MjE0Nn0.FE24fzRujAJYo1pfnlPiL_f7QrI5-lGdMu2RVKTFCIM";

export const supabase = createClient(supabaseUrl, supabaseKey);