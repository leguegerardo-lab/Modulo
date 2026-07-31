import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ywxxzpchcntixdpgvyqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eHh6cGNoY250aXhkcGd2eXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MzU4MTYsImV4cCI6MjEwMTExMTgxNn0.4FdmnwqLLzEvdnCMTXU1fGru49XT3bTPw9G7pPW7Klc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
