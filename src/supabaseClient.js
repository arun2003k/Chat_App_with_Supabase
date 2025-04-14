import { createClient } from "@supabase/supabase-js"; 

const supabaseUrl = "https://wnovshdbuptvlpjdmebs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indub3ZzaGRidXB0dmxwamRtZWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTkwMjQsImV4cCI6MjA1OTg3NTAyNH0.XGnuY84t-gAckLF4kas-e9lrslpMcuuwytyQsm6QU1g";

export const supabase= createClient(supabaseUrl, supabaseAnonKey);