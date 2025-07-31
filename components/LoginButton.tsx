
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginButton() {
  const supabase = createClientComponentClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-white text-black font-semibold rounded-md shadow hover:bg-gray-200 transition"
    >
      Log ind med Google
    </button>
  )
}
