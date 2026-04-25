import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://srcoyyibzdmddpexhbsp.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyY295eWliemRtZGRwZXhoYnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjM0ODksImV4cCI6MjA5MjU5OTQ4OX0.EvtKi5Xp8cBBsozH6LiMRMPfjuRPUgKUa95L6mrDmU8'

export const sb = createClient(SUPA_URL, SUPA_KEY)
