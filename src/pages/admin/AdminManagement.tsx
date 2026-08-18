import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  UserCog,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'

type Permission = {
  key: string
  label: string
  description: string
}

type Admin = {
  id: string
  name: string
  email: string
  role: 'MASTER_ADMIN' | 'ADMIN'
  permissions: string[]
  isActive: boolean
  createdAt: string
  lastLoginAt: string
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'MASTER_ADMIN',
    permissions: [] as string[],
    isActive: true
  })

  // Get current admin info from sessionStorage
  const currentAdmin = JSON.parse(sessionStorage.getItem('adminData') || '{}')

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }

    // Check if current admin has permission to manage admins
    if (currentAdmin.role !== 'MASTER_ADMIN') {
      navigate('/admin/dashboard')
      return
    }

    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const [adminsRes, permsRes] = await Promise.all([
        fetch('/api/admins'),
        fetch('/api/admins/permissions/list')
      ])

      if (adminsRes.ok) setAdmins(await adminsRes.json())
      if (permsRes.ok) setPermissions(await permsRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const openCreateModal = () => {
    setEditingAdmin(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      permissions: [],
      isActive: true
    })
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive
    })
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAdmin ? `/api/admins/${editingAdmin.id}` : '/api/admins'
      const method = editingAdmin ? 'PUT' : 'POST'

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive
      }

      // Only include password if it's set (for create or if updating password)
      if (formData.password) {
        payload.password = formData.password
      }

      // Include createdBy for new admins
      if (!editingAdmin) {
        payload.createdBy = currentAdmin.id
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save admin')
      }

      await loadData()
      closeModal()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save admin')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setShowPassword(false)
    setEditingAdmin(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      permissions: [],
      isActive: true
    })
  }

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete admin "${admin.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admins/${admin.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete admin')
      }
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete admin')
    }
  }

  const togglePermission = (permKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }))
  }

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: permissions.map(p => p.key)
    }))
  }

  const deselectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }))
  }

  return (
    <div className="min-h-screen bg-white text-white p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pt-20">
          <div className="space-y-3">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Access Control</span>
            <h1 className="text-3xl md:text-5xl font-bungee font-black tracking-tighter uppercase italic leading-none">
              Admin <span className="text-primary">Management</span>
            </h1>
            <p className="text-white/45 font-medium italic max-w-2xl">
              Create and manage admin users with specific permissions and roles
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="h-12 px-6 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/20"
          >
            <Plus size={16} /> Create Admin
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/35 font-black uppercase tracking-[0.24em]">Total Admins</p>
              <p className="text-3xl font-sans font-black text-white mt-1">{admins.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/35 font-black uppercase tracking-[0.24em]">Active</p>
              <p className="text-3xl font-sans font-black text-white mt-1">
                {admins.filter(a => a.isActive).length}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
              <UserCog size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/35 font-black uppercase tracking-[0.24em]">Master Admins</p>
              <p className="text-3xl font-sans font-black text-white mt-1">
                {admins.filter(a => a.role === 'MASTER_ADMIN').length}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Admins List */}
        <div className="space-y-5">
          {admins.map((admin, index) => (
            <motion.article
              key={admin.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Admin Info */}
                <div className="flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bungee font-black uppercase italic tracking-tighter text-white">
                      {admin.name}
                    </h3>
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {admin.role}
                    </span>
                    {!admin.isActive && (
                      <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        Inactive
                      </span>
                    )}
                    {admin.isActive && (
                      <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-white/60 text-sm font-medium">{admin.email}</p>

                  <div className="flex flex-wrap gap-2">
                    {admin.permissions.length > 0 ? (
                      admin.permissions.slice(0, 5).map(perm => (
                        <span
                          key={perm}
                          className="text-[8px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                        >
                          {permissions.find(p => p.key === perm)?.label || perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                        No Permissions
                      </span>
                    )}
                    {admin.permissions.length > 5 && (
                      <span className="text-[8px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-full bg-white/5 text-white/60">
                        +{admin.permissions.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.16em]">
                    <span className="flex items-center gap-2">
                      <Clock size={12} className="text-secondary" />
                      Last Login: {new Date(admin.lastLoginAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {admin.role !== 'MASTER_ADMIN' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="h-12 px-5 rounded-2xl bg-secondary text-white hover:bg-secondary/80 transition-all flex items-center justify-center"
                      title="Edit admin"
                    >
                      <Edit2 size={17} />
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      className="h-12 px-5 rounded-2xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                      title="Delete admin"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>
            </motion.article>
          ))}

          {admins.length === 0 && (
            <div className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 text-center">
              <Shield className="mx-auto text-white/20 mb-5" size={44} />
              <h3 className="text-2xl font-bungee font-black uppercase italic tracking-tighter text-white/50">
                No admins found
              </h3>
              <p className="text-white/35 text-sm font-medium italic mt-2">Create your first admin user to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bungee font-black uppercase italic tracking-tighter text-white">
                  {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
                </h2>
                <p className="text-white/45 text-sm font-medium italic mt-2">
                  {editingAdmin ? 'Update admin details and permissions' : 'Add a new admin user with specific permissions'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] ml-4">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/25 outline-none focus:border-secondary transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] ml-4">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@waybond.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/25 outline-none focus:border-secondary transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] ml-4">
                  Password {editingAdmin ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAdmin ? 'Enter new password' : 'Enter password (min 6 characters)'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder:text-white/25 outline-none focus:border-secondary transition-all"
                    required={!editingAdmin}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] ml-4">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value.toUpperCase() })}
                  placeholder="Enter role name (e.g., ADMIN, MANAGER, EDITOR)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/25 outline-none focus:border-secondary transition-all uppercase"
                  required
                />
                <p className="text-white/30 text-xs font-medium italic ml-4 mt-2">
                  Enter a custom role name. Common roles: ADMIN, MANAGER, EDITOR, VIEWER
                </p>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] ml-4">
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-[9px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-xl bg-secondary/20 text-secondary hover:bg-secondary/30 transition-all"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      className="text-[9px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Selected Permissions Display */}
                {formData.permissions.length > 0 && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4">
                    <p className="text-[9px] uppercase font-black text-secondary tracking-[0.2em] mb-3">
                      Selected Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.permissions.map(permKey => {
                        const perm = permissions.find(p => p.key === permKey)
                        return (
                          <div
                            key={permKey}
                            className="flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-xl px-3 py-2"
                          >
                            <CheckCircle2 size={14} className="text-secondary" />
                            <span className="text-xs font-black text-white">
                              {perm?.label || permKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePermission(permKey)}
                              className="ml-1 text-white/60 hover:text-red-400 transition-colors"
                              title="Remove permission"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Available Permissions to Add */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                  <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mb-3">
                    {formData.permissions.length === 0 ? 'Select Features' : 'Add More Features'}
                  </p>
                  {permissions
                    .filter(perm => !formData.permissions.includes(perm.key))
                    .map(perm => (
                      <label
                        key={perm.key}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-secondary/30 transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-secondary checked:border-secondary cursor-pointer"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white group-hover:text-secondary transition-colors">
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 font-medium mt-1">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  
                  {permissions.filter(perm => !formData.permissions.includes(perm.key)).length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="text-green-400 mx-auto mb-3" size={32} />
                      <p className="text-sm text-white/60 font-medium">All permissions selected!</p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-300/90 font-medium leading-relaxed">
                    Select the features this admin can access. You can add or remove permissions anytime.
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-black text-white">Active Status</span>
                  <p className="text-xs text-white/40 font-medium mt-1">
                    Inactive admins cannot log in to the system
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-12 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.16em]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl bg-secondary text-white hover:bg-secondary/80 transition-all font-black text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminManagement
