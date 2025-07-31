
import LoginButton from '@/components/LoginButton'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#1A1B29] via-[#2C2F46] to-[#10131C] text-white text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Kommercia</h1>
      <p className="text-lg mb-8">Your Commercial Department in the Cloud</p>
      <LoginButton />
    </div>
  )
}
