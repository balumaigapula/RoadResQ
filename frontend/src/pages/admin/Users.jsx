import { useState } from 'react'
import { Search, MoreVertical } from 'lucide-react'

const USERS = [
  { id: 'usr_101', name: 'Arjun Mehta', email: 'arjun.customer@roadresq.in', role: 'Customer', status: 'Active', joined: '2025-11-02' },
  { id: 'usr_102', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', role: 'Customer', status: 'Active', joined: '2025-12-14' },
  { id: 'usr_103', name: 'Kabir Singh', email: 'kabir.singh@example.com', role: 'Customer', status: 'Suspended', joined: '2026-01-08' },
  { id: 'usr_104', name: 'Meera Iyer', email: 'meera.iyer@example.com', role: 'Customer', status: 'Active', joined: '2026-02-20' },
]

export default function AdminUsers() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [users, setUsers] = useState(USERS)

  const filtered = users.filter((u) =>
    (filter === 'all' || u.status.toLowerCase() === filter) &&
    (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
  )

  function toggleStatus(id) {
    setUsers((list) => list.map((u) => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Users</h2>
      <p className="text-ash-500 text-sm mb-6">Manage customer accounts.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-ash-300 text-sm outline-none focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-2 rounded-md text-xs font-semibold capitalize ${filter === f ? 'bg-navy-700 text-white' : 'bg-ash-100 text-ash-600'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-ash-200 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-ash-50 text-ash-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash-200">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3.5 font-medium text-navy-700">{u.name}</td>
                <td className="px-5 py-3.5 text-ash-600">{u.email}</td>
                <td className="px-5 py-3.5 text-ash-600">{new Date(u.joined).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleStatus(u.id)} className="text-xs font-semibold text-rescue-500 hover:text-rescue-600">
                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-ash-500 text-sm">No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
