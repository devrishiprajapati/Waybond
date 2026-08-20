import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Search, UserRound, UsersRound } from 'lucide-react'
import { getAllRegisteredUsers, registerUser, RegisteredUser } from '../../lib/adminStorage'
import { getUser } from '../../lib/auth'

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function AdminUsers() {
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    const currentUser = getUser()
    if (currentUser) registerUser(currentUser)
    getAllRegisteredUsers().then(setUsers)
  }, [navigate])

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim()
    return !query ? users : users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query))
  }, [search, users])

  return (
    <div className="min-h-screen bg-white text-white px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-28 lg:pb-20">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-10"><Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link><p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Explorer directory</p><h1 className="text-4xl md:text-6xl font-sans font-black uppercase italic tracking-tighter liquid-text font-bungee">Registered <span className="text-primary font-bungee">Users</span></h1></div>
        <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-5 mb-7 flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center"><UsersRound size={22} /></div><div><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.2em]">Registered users</p><p className="text-2xl font-sans font-black text-white">{users.length}</p></div></div><label className="relative w-full sm:max-w-md"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" /></label></div>
        <div className="overflow-x-auto liquid-glass-dark border border-white/10 rounded-[2rem]"><table className="w-full min-w-[700px] text-left"><thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.18em] text-white/35"><tr><th className="p-6">User</th><th className="p-6">Email</th><th className="p-6">Joined</th><th className="p-6">Last sign in</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/admin/users/${user.id}`) }} tabIndex={0} role="button" className="border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.04] focus:outline-none focus:bg-white/[0.04]"><td className="p-6"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center"><UserRound size={18} /></span><span className="font-bold text-white">{user.name}</span></div></td><td className="p-6 text-white/60 text-sm"><span className="flex items-center gap-2"><Mail size={14} className="text-secondary" />{user.email}</span></td><td className="p-6 text-white/55 text-sm">{formatDate(user.joinedAt)}</td><td className="p-6 text-white/55 text-sm">{formatDate(user.lastLoginAt)}</td></tr>)}</tbody></table></div>
        {filteredUsers.length === 0 && <div className="py-12 text-center text-white/45"><UserRound className="mx-auto mb-4 text-white/20" size={40} /><p>No registered users yet.</p></div>}
      </div>
    </div>
  )
}
