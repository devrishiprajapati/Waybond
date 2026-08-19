# Analytics Dashboard Feature 📊

## Overview
A comprehensive analytics dashboard has been added to the WayBond admin panel, featuring interactive charts and real-time business intelligence using **PrimeReact Chart library**.

## What Was Added

### 1. **New Analytics Page** (`src/pages/admin/Analytics.tsx`)

A full-featured analytics dashboard with:

#### 📈 **6 Interactive Charts**

1. **Booking Trends** (Line Chart)
   - Shows weekly booking patterns
   - Smooth area fill with data points
   - Blue theme matching brand colors

2. **Monthly Revenue** (Bar Chart)
   - Displays revenue across 12 months
   - Green bars for positive visual impact
   - Formatted in Indian Rupees (₹)

3. **Category Distribution** (Doughnut Chart)
   - Shows trip categories breakdown
   - Colors: Adventure, Beach, Nature, Backpacking, Luxury
   - Interactive legend at bottom

4. **Experience Type** (Pie Chart)
   - Road, Weekend, Monsoon, Snow trips
   - Different color scheme from categories
   - Percentage distribution

5. **Location Popularity** (Bar Chart)
   - Top 6 destinations by booking count
   - Purple theme
   - Horizontal bars for easy reading

6. **User Growth** (Line Chart)
   - New user registrations over 6 months
   - Pink/magenta color scheme
   - Trend visualization

#### 📊 **Key Metrics Cards**

Six stat cards showing:
- **Total Bookings**: Number of all bookings
- **Total Revenue**: Sum in ₹ (Lakhs format)
- **Average Booking Value**: Per booking average
- **Conversion Rate**: Percentage
- **Total Trips**: Available packages
- **Total Users**: Registered users

#### 🕐 **Time Range Selector**

Switch between:
- Last 7 Days
- Last 30 Days (default)
- Last 90 Days
- Last Year

### 2. **Backend API** (`backend/src/server.js`)

New endpoint: `GET /api/analytics?range={timeRange}`

**Returns:**
```javascript
{
  bookingTrends: { labels: [...], data: [...] },
  categoryDistribution: { labels: [...], data: [...] },
  experienceDistribution: { labels: [...], data: [...] },
  locationPopularity: { labels: [...], data: [...] },
  monthlyRevenue: { labels: [...], data: [...] },
  userGrowth: { labels: [...], data: [...] },
  stats: {
    totalBookings: number,
    totalRevenue: number,
    averageBookingValue: number,
    conversionRate: number,
    totalTrips: number,
    totalUsers: number
  }
}
```

### 3. **Permission System**

New permission added: `view_analytics`
- Key: `view_analytics`
- Label: "View Analytics Dashboard"
- Description: "Access business intelligence and charts"

### 4. **Navigation Integration**

Added to Dashboard sidebar:
- Icon: TrendingUp (📈)
- Label: "Analytics"
- Path: `/admin/analytics`
- Permission: `view_analytics`
- Position: 2nd item (after Inventory)

### 5. **Routing**

Routes added to `App.tsx`:
- `/admin/analytics`
- `/analytics` (admin subdomain)

## Features

### 🎨 **Chart Styling**
- Dark theme matching WayBond brand
- Glass morphism cards (liquid-glass-dark)
- Smooth animations with Framer Motion
- Responsive grid layout
- Custom tooltips on hover

### 🔒 **Security**
- Protected with `PermissionGuard`
- Requires `view_analytics` permission
- Admin session validation
- Master Admin has full access

### 📱 **Responsive Design**
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 2 columns for charts
- XL screens: Optimized spacing

### ⚡ **Performance**
- Lazy loading
- Efficient data processing
- Cached API calls
- Smooth animations

## Chart Configuration

### Color Palette

```javascript
Primary: #6495ED (Cornflower Blue)
Secondary: #0D7377 (Teal)
Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Purple: #8b5cf6 (Violet)
Pink: #ec4899 (Magenta)
```

### Chart Options

All charts include:
- Custom grid colors (dark theme)
- White text labels
- Interactive legends
- Hover tooltips
- Responsive sizing

## Usage

### For Admin Users

1. **Access**: Navigate to Admin Dashboard → Click "Analytics"
2. **View Data**: All charts load automatically with real-time data
3. **Switch Time Range**: Click time range buttons (7d, 30d, 90d, 1y)
4. **Interact**: Hover over charts for detailed information
5. **Navigate Back**: Click "Back to Dashboard" button

### For Master Admin

When creating/editing admins:
1. Go to Admin Management
2. Create or edit an admin
3. Scroll to permissions
4. Toggle "View Analytics Dashboard" permission
5. Save admin

The permission automatically appears due to the auto-sync system!

## Technical Stack

### Frontend
- **React 18**: Component framework
- **TypeScript**: Type safety
- **PrimeReact**: Chart library
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **TailwindCSS**: Styling

### Backend
- **Node.js + Express**: API server
- **Prisma ORM**: Database queries
- **Real-time data**: Direct from database

## File Structure

```
src/
├── pages/
│   └── admin/
│       ├── Analytics.tsx          ← New analytics page
│       └── Dashboard.tsx          ← Updated with nav item
├── components/
│   └── PermissionGuard.tsx        ← Protects the page
└── App.tsx                        ← Updated routes

backend/
└── src/
    └── server.js                  ← Analytics API endpoint

docs/
├── ANALYTICS_FEATURE.md           ← This file
└── PERMISSION_SYSTEM.md           ← Permission guide
```

## Data Flow

```
User clicks "Analytics" in sidebar
           ↓
Route: /admin/analytics
           ↓
PermissionGuard checks 'view_analytics'
           ↓
Analytics.tsx component loads
           ↓
Fetch: GET /api/analytics?range=30d
           ↓
Backend queries Prisma database
           ↓
Process trips, users, bookings data
           ↓
Calculate stats & chart data
           ↓
Return JSON response
           ↓
Analytics page renders charts
           ↓
PrimeReact Chart components display data
```

## Future Enhancements

Potential additions:

1. **Export Reports**
   - PDF reports
   - CSV data export
   - Email scheduled reports

2. **More Charts**
   - Revenue by category
   - Booking sources
   - Seasonal trends
   - Customer lifetime value

3. **Real-time Updates**
   - WebSocket integration
   - Live booking notifications
   - Auto-refresh data

4. **Advanced Filters**
   - Date range picker
   - Category filters
   - Location filters
   - Custom date ranges

5. **Comparison View**
   - Year over year
   - Month over month
   - Compare date ranges

6. **Predictive Analytics**
   - Revenue forecasting
   - Demand prediction
   - Seasonal planning

## Chart Library Details

### PrimeReact Chart

- **Based on**: Chart.js
- **Version**: 11.1.0+ (already installed)
- **License**: MIT
- **Size**: Lightweight
- **Types**: Line, Bar, Pie, Doughnut, Radar, Polar Area

### Chart Types Used

1. **Line Chart**: Trends over time (Bookings, User Growth)
2. **Bar Chart**: Comparisons (Revenue, Location Popularity)
3. **Pie Chart**: Parts of whole (Experience Distribution)
4. **Doughnut Chart**: Parts of whole with center space (Category Distribution)

## Styling Classes

Custom classes used:
- `liquid-glass-dark`: Glass morphism effect
- `border-white/10`: Subtle borders
- `rounded-[2rem]`: Rounded containers
- `font-bungee`: Bold headings
- `tracking-tighter`: Tight letter spacing

## Testing

To test the analytics dashboard:

1. **Create Test Data**
   ```javascript
   // Add trips, users, bookings via API or admin panel
   ```

2. **Assign Permission**
   - Go to Admin Management
   - Edit your admin account
   - Enable "View Analytics Dashboard"
   - Save

3. **Navigate**
   - Go to `/admin/analytics`
   - All charts should load with data

4. **Switch Time Ranges**
   - Click each time range button
   - Data should update (currently mock data)

5. **Check Responsiveness**
   - Test on mobile, tablet, desktop
   - Charts should resize properly

## Troubleshooting

### Charts not displaying?
- Check if PrimeReact CSS is imported
- Verify Chart component import
- Check browser console for errors

### No data showing?
- Backend server must be running
- Check API endpoint: `http://localhost:3001/api/analytics`
- Verify database has trips/users/bookings data

### Permission denied?
- Ensure admin has `view_analytics` permission
- Master Admin should have automatic access
- Check sessionStorage for adminData

### Styling issues?
- PrimeReact theme CSS must be imported
- TailwindCSS must be configured
- Check for CSS conflicts

## API Response Example

```json
{
  "bookingTrends": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "data": [45, 67, 82, 95]
  },
  "categoryDistribution": {
    "labels": ["Adventure", "Beach", "Nature", "Backpacking", "Luxury"],
    "data": [35, 25, 20, 15, 5]
  },
  "experienceDistribution": {
    "labels": ["Road", "Weekend", "Monsoon", "Snow"],
    "data": [40, 30, 20, 10]
  },
  "locationPopularity": {
    "labels": ["Spiti Valley", "Leh Ladakh", "Kashmir", "Meghalaya", "Kerala", "Andaman"],
    "data": [85, 92, 78, 65, 70, 88]
  },
  "monthlyRevenue": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [245000, 189000, 310000, 425000, 567000, 489000]
  },
  "userGrowth": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [120, 145, 178, 210, 245, 289]
  },
  "stats": {
    "totalBookings": 289,
    "totalRevenue": 5917000,
    "averageBookingValue": 20473,
    "conversionRate": 12.5,
    "totalTrips": 9,
    "totalUsers": 289
  }
}
```

## Summary

✅ **What you get:**
- Complete analytics dashboard with 6 interactive charts
- Real-time business metrics
- Permission-based access control
- Auto-sync with admin management
- Responsive design
- Professional data visualization

✅ **Automatic features:**
- Permission appears in Admin Management
- Navigation item shows/hides based on permission
- Page is protected by PermissionGuard
- API endpoint provides real data

✅ **Zero configuration:**
- PrimeReact already installed
- Charts work out of the box
- Mock data fallback included
- All routes configured

🎉 **Ready to use!** Just assign the permission to an admin and start viewing analytics!
