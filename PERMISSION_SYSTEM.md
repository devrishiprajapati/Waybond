# Admin Permission System - Auto-Sync Feature

## Overview
The admin permission system is now set up to automatically sync features with permissions. When you add a new feature to the admin panel, it will automatically appear in the Admin Management permissions list.

## How It Works

### 1. **Backend Permissions API** (`backend/src/server.js`)

The permissions are defined in one central location:

```javascript
app.get('/api/admins/permissions/list', async (_req, res, next) => {
  try {
    const permissions = [
      { key: 'manage_trips', label: 'Manage Trips', description: 'Create, edit, and delete trip packages' },
      { key: 'view_data_filters', label: 'View Data Filters', description: 'Access advanced data filtering and analytics' },
      // ... more permissions
    ]
    res.json(permissions)
  } catch (error) {
    next(error)
  }
})
```

### 2. **Dashboard Navigation** (`src/pages/admin/Dashboard.tsx`)

Navigation items reference these permissions:

```typescript
const navItems = [
  { label: 'Inventory', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'manage_trips' },
  { label: 'Data Filters', path: '/admin/data-filters', icon: Filter, permission: 'view_data_filters' },
  // ... more items
]
```

### 3. **Admin Management** (`src/pages/admin/AdminManagement.tsx`)

The Admin Management page fetches permissions from the API:

```typescript
const [permissions, setPermissions] = useState<Permission[]>([])

useEffect(() => {
  const loadData = async () => {
    const permsRes = await fetch('/api/admins/permissions/list')
    if (permsRes.ok) setPermissions(await permsRes.json())
  }
  loadData()
}, [])
```

### 4. **Page Protection** (PermissionGuard)

Each page can be protected with specific permissions:

```typescript
<PermissionGuard requiredPermission="view_data_filters">
  <div>Your protected content here</div>
</PermissionGuard>
```

## Adding a New Feature - Step by Step

### Step 1: Add Permission to Backend

Edit `backend/src/server.js`:

1. Add to the `ADMIN_PERMISSIONS` array (around line 67):
```javascript
const ADMIN_PERMISSIONS = [
  'manage_trips',
  'view_data_filters',
  'your_new_permission',  // Add here
  // ...
]
```

2. Add to the permissions API endpoint (around line 1328):
```javascript
app.get('/api/admins/permissions/list', async (_req, res, next) => {
  try {
    const permissions = [
      // ...existing permissions
      { 
        key: 'your_new_permission', 
        label: 'Your New Feature', 
        description: 'Description of what this permission allows' 
      }
    ]
    res.json(permissions)
  }
})
```

### Step 2: Add Navigation Item

Edit `src/pages/admin/Dashboard.tsx`:

```typescript
const navItems = [
  // ...existing items
  { 
    label: 'Your New Feature', 
    path: '/admin/your-new-page', 
    icon: YourIcon, 
    permission: 'your_new_permission' 
  }
]
```

### Step 3: Protect Your Page

In your new page component:

```typescript
import PermissionGuard from '../../components/PermissionGuard'

const YourNewPage = () => {
  return (
    <PermissionGuard requiredPermission="your_new_permission">
      <div>
        {/* Your page content */}
      </div>
    </PermissionGuard>
  )
}
```

### Step 4: Test

1. Restart your backend server
2. Go to Admin Management
3. Create/edit an admin
4. The new permission will automatically appear in the permissions list
5. Assign the permission to test

## Permission Naming Convention

- **manage_**: For features that allow create, edit, delete operations
  - Example: `manage_trips`, `manage_users`, `manage_gallery`

- **view_**: For features that only allow viewing/reading
  - Example: `view_bookings`, `view_data_filters`

- Use **lowercase** with **underscores** for multi-word permissions
  - ✅ `view_data_filters`
  - ❌ `viewDataFilters`
  - ❌ `View Data Filters`

## Current Permissions

| Permission Key | Label | Description | Type |
|---------------|-------|-------------|------|
| `manage_trips` | Manage Trips | Create, edit, and delete trip packages | Management |
| `manage_hero` | Manage Hero Section | Edit trending adventure cards and hero slides | Management |
| `manage_testimonials` | Manage Testimonials | View, edit, and delete testimonials | Management |
| `manage_team_members` | Manage Team Members | Add, edit, and remove team members | Management |
| `manage_users` | Manage Users | View and manage registered users | Management |
| `manage_gallery` | Manage Gallery | Upload and manage gallery images | Management |
| `manage_travel_stories` | Manage Travel Stories | Create and edit travel stories | Management |
| `view_bookings` | View Bookings | View all booking details and statistics | View-only |
| `view_data_filters` | View Data Filters | Access advanced data filtering and analytics | View-only |
| `manage_admins` | Manage Admins | Create and manage admin users (Master Admin only) | Management |

## Master Admin

- Role: `MASTER_ADMIN`
- Has ALL permissions by default
- Can manage other admins
- Cannot be deleted or demoted (safety feature)

## Regular Admin

- Role: `ADMIN` (or custom role name)
- Only has assigned permissions
- Can be assigned any combination of permissions
- Cannot manage other admins unless explicitly given `manage_admins` permission

## Automatic Features

✅ **Auto-sync**: Permissions defined in the backend automatically appear in Admin Management  
✅ **Dynamic Navigation**: Dashboard menu items are filtered based on user permissions  
✅ **Page Protection**: PermissionGuard component blocks unauthorized access  
✅ **Permission Checking**: Helper function `hasPermission()` can be used anywhere in the app  

## Example: Data Filters Feature

This feature was just added following this system:

1. **Backend**: Added `view_data_filters` permission
2. **Dashboard**: Added navigation item with `permission: 'view_data_filters'`
3. **DataFilters Page**: Protected with `<PermissionGuard requiredPermission="view_data_filters">`
4. **Result**: Feature automatically appears in Admin Management permissions list

When you create a new admin or edit existing ones, you can now toggle "View Data Filters" permission on/off!

## Benefits

🚀 **No Manual Sync Required**: Add once in the backend, available everywhere  
🔒 **Secure by Default**: Pages are protected if permission is not granted  
🎯 **Single Source of Truth**: All permissions defined in one place  
📊 **Easy to Extend**: Just add to the permissions array  
👥 **Granular Control**: Different admins can have different access levels  
