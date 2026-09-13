export type Permission = {
  key: string
  label: string
  description: string
}

export const ALL_PERMISSIONS: Permission[] = [
  {
    key: 'manage_trips',
    label: 'Trips Management',
    description: 'Access trip inventory dashboard, create, edit, and delete trip packages'
  },
  {
    key: 'view_analytics',
    label: 'Analytics',
    description: 'Access analytics dashboard with booking trends, revenue reports, and user growth metrics'
  },
  {
    key: 'view_data_filters',
    label: 'Data Filters',
    description: 'View and manage booking data, edit bookings, update payments, and transfer packages'
  },
  {
    key: 'manage_hero',
    label: 'Trending Adventures',
    description: 'Manage homepage hero section and trending adventure carousel'
  },
  {
    key: 'manage_travel_stories',
    label: 'Travel Stories',
    description: 'Create, edit, and manage travel stories and blog posts'
  },
  {
    key: 'manage_testimonials',
    label: 'Testimonials',
    description: 'Manage customer testimonials and reviews'
  },
  {
    key: 'manage_team_members',
    label: 'Team Members',
    description: 'Add, edit, and remove team members displayed on the website'
  },
  {
    key: 'manage_users',
    label: 'Users',
    description: 'View user profiles, manage user details, and view booking history'
  },
  {
    key: 'view_bookings',
    label: 'Bookings & Payments',
    description: 'Manage payments, upload tickets, and process cancellations'
  },
  {
    key: 'manage_enquiries',
    label: 'Enquiries',
    description: 'View and manage customer enquiries and trip interest requests'
  },
  {
    key: 'manage_promo_codes',
    label: 'Promo Codes',
    description: 'Create and manage promotional discount codes'
  },
  {
    key: 'manage_gallery',
    label: 'Gallery',
    description: 'Upload and manage travel photos in the website gallery'
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
