
interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-[#2C2F46] text-white p-6 rounded-xl shadow-lg w-full">
      <p className="text-sm text-gray-400">{label}</p>
      <h3 className="text-2xl font-semibold">{value}</h3>
    </div>
  )
}
