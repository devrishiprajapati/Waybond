export type Permission = {
  key: string
  label: string
  description: string
}

export const ALL_PERMISSIONS: Permission[] = [
  {
    key: 'data_filters_view',
    label: 'Data Filters - View',
    description: 'View all data in the Data Filters section (Trips, Users, Bookings tables)'
  },
  {
    key: 'data_filters_edit',
    label: 'Data Filters - Edit',
    description: 'Edit and modify data in the Data Filters section tables'
  },
  {
    key: 'trips_manage',
    label: 'Trips Management',
    description: 'Create, edit, and delete trip packages'
  },
  {
    key: 'users_manage',
    label: 'Users Management',
    description: 'View and manage registered users'
  },
  {
    key: 'bookings_manage',
    label: 'Bookings Management',
    description: 'View and manage all bookings'
  },
  {
    key: 'analytics_view',
    label: 'Analytics - View',
    description: 'Access analytics and reports dashboard'
  },
  {
    key: 'content_manage',
    label: 'Content Management',
    description: 'Manage homepage, gallery, testimonials, and stories'
  },
  {
    key: 'team_manage',
    label: 'Team Management',
    description: 'Manage team members and their information'
  },
  {
    key: 'payment_manage',
    label: 'Payment Management',
    description: 'View and update payment statuses'
  }
]

export const getPermissionLabel = (key: string): string => {
  const permission = ALL_PERMISSIONS.find(p => p.key === key)
  return permission?.label || key
}

export const getPermissionDescription = (key: string): string => {
  const permission = ALL_PERMISSIONS.find(p => p.key === key)
  return permission?.description || ''
}
