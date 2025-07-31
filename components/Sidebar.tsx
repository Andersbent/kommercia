
'use client'

import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#1A1B29] text-white p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-6">Kommercia</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="hover:bg-[#2C2F46] p-2 rounded">Dashboard</Link>
        <Link href="/leads" className="hover:bg-[#2C2F46] p-2 rounded">Leads</Link>
      </nav>
    </aside>
  )
}
