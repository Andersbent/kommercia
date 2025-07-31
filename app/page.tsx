
import LoginButton from '@/components/LoginButton'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1B29] via-[#2C2F46] to-[#10131C] text-white font-sans px-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Kommercia</h1>
        <p className="text-lg text-gray-300">Your Commercial Department in the Cloud</p>
        <LoginButton />
      </div>
    </div>
  )
}
