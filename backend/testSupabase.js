import supabase from './services/supabase.js'

const { data, error } = await supabase.from('_test_connection').select('*').limit(1)

if (error && !error.message.includes('Could not find the table')) {
  console.error('Supabase connection failed:', error.message)
  process.exit(1)
}

console.log('Supabase client initialised successfully.')
