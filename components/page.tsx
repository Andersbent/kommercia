
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/StatCard'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#1A1B29] via-[#2C2F46] to-[#10131C]">
      <Sidebar />
      <main className="flex-1 p-10 space-y-10">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Leads" value="124" />
          <StatCard label="New This Week" value="17" />
          <StatCard label="Avg. Response Time" value="2h 34m" />
        </div>
      </main>
    </div>
  )
}
