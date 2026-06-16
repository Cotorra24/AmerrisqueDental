import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0'

const supabase = createClient(
  'https://nwwpelupyejltapdkfxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53d3BlbHVweWVqbGRrZnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDY4ODcsImV4cCI6MjA5MTI4Mjg4N30.RCVo0oZdTyxyVMqur8qLqkD1O72pxlT7q2UCMpjF7Us'
)

const resp = await supabase.auth.signInWithPassword({
  email: 'admin@amerrisque.com',
  password: 'Admin1234',
})

console.log(JSON.stringify(resp, null, 2))
