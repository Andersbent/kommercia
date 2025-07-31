
'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 text-white font-semibold rounded-xl shadow-md hover:brightness-110 transition-all duration-200"
    >
      Enter
    </button>
  )
}
