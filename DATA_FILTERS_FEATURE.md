# Data Filters Feature - Implementation Guide

## Overview
A comprehensive data filtering and analytics page using Material React Table to filter and analyze trips by category, experience type, and users with advanced search capabilities.

## Features Implemented

### 1. **Data Filters Page** (`/admin/data-filters`)
A dedicated page with advanced filtering for:
- **Trips Data**: Filter by category, experience, price, location
- **Users Data**: Filter by role, joined date, last login

### 2. **Material React Table Features**
All these features are built-in and available:

#### Column Filtering
- Click filter icon on any column header
- Select filters for category/experience columns
- Text search for other columns

#### Global Search
- Search bar at the top
- Searches across all columns simultaneously

#### Sorting
- Click column headers to sort
- Multi-column sorting with Shift+Click

#### Column Ordering
- Drag and drop column headers to reorder

#### Grouping
- Drag column headers to group panel
- Group data by category, experience, role, etc.

#### Row Selection
- Checkbox selection for multiple rows
- Useful for bulk operations

#### Column Visibility
- Eye icon to show/hide columns
- Customize your view

#### Export
- Export filtered data to CSV/Excel
- Export all or selected rows

#### Column Resizing
- Drag column borders to resize

### 3. **Two Tabs**
- **Trips Data Tab**: All trip packages with filtering
- **Users Data Tab**: All registered users with filtering

### 4. **Statistics Dashboard**
- Total Trips count
- Total Users count
- Number of unique Categories
- Number of unique Experience types

### 5. **Dark Theme Integration**
- Matches WayBond dark theme
- Custom colors for better visibility

## How to Use

### Accessing the Feature
1. Login to admin dashboard
2. Click **"Data Filters"** in the sidebar (Filter icon)
3. Permission required: `view_bookings`

### Filtering Trips
1. Select **"Trips Data"** tab
2. Use column filters to filter by:
   - **Category**: Select from dropdown (Trekking, Adventure, etc.)
   - **Experience**: Select from dropdown (monsoon, weekend, road, snow)
   - **Location**: Text search
   - **Price**: Number range
3. Use global search to search across all columns
4. Click column headers to sort

### Filtering Users
1. Select **"Users Data"** tab
2. Filter by:
   - **Role**: Select USER, ADMIN, etc.
   - **Name/Email**: Text search
   - **Dates**: Filter by joined date or last login
3. Export filtered results

### Advanced Features

#### Grouping Data
1. Drag column header (e.g., "Category") to the group panel at top
2. Data will be grouped by that column
3. Expand/collapse groups

#### Multi-Column Sorting
1. Click first column header to sort
2. Hold Shift and click another column header
3. Data sorts by both columns

#### Exporting Data
1. Filter data as needed
2. Click export button (top right)
3. Choose format (CSV/Excel)
4. Download filtered results

#### Column Customization
1. Click eye icon (top right)
2. Check/uncheck columns to show/hide
3. Reorder columns by dragging headers

## Technical Details

### Files Created
- `src/pages/admin/DataFilters.tsx` - Main data filters page

### Files Modified
- `src/App.tsx` - Added routes for `/admin/data-filters`
- `src/pages/admin/Dashboard.tsx` - Added Data Filters menu item

### Dependencies Used
- `material-react-table` v3.2.1 (already installed)
- `@mui/material` v9.3.1 (already installed)
- `@mui/icons-material` v9.3.1 (already installed)

### API Endpoints Used
- `GET /api/trips` - Fetch all trips
- `GET /api/users` - Fetch all users
- `GET /api/admin/dashboard` - Fetch dashboard stats

## Column Definitions

### Trips Table Columns
| Column | Type | Filterable | Sortable |
|--------|------|------------|----------|
| ID | Number | ✅ | ✅ |
| Trip Title | Text | ✅ | ✅ |
| Location | Text | ✅ | ✅ |
| Category | Dropdown | ✅ (Select) | ✅ |
| Experience Type | Dropdown | ✅ (Select) | ✅ |
| Price | Currency | ✅ | ✅ |
| Duration | Text | ✅ | ✅ |
| Next Batch | Date | ✅ | ✅ |

### Users Table Columns
| Column | Type | Filterable | Sortable |
|--------|------|------------|----------|
| User ID | Text | ✅ | ✅ |
| Name | Text | ✅ | ✅ |
| Email | Text | ✅ | ✅ |
| Role | Dropdown | ✅ (Select) | ✅ |
| Joined Date | Date | ✅ | ✅ |
| Last Login | Date | ✅ | ✅ |

## Permission Requirements

The Data Filters page requires:
- **Permission**: `view_bookings`
- Any admin with this permission can access the feature

## Example Use Cases

### 1. Find All Trekking Trips
1. Go to Trips Data tab
2. Click Category filter
3. Select "Trekking"
4. Results show only trekking trips

### 2. Find Weekend Experience Trips
1. Go to Trips Data tab
2. Click Experience filter
3. Select "weekend"
4. Export results for marketing

### 3. Find Recently Joined Users
1. Go to Users Data tab
2. Sort by "Joined Date" (descending)
3. See newest users first

### 4. Group Trips by Experience Type
1. Go to Trips Data tab
2. Drag "Experience Type" header to group panel
3. See trips organized by monsoon, weekend, road, snow

### 5. Find High-Value Trips
1. Go to Trips Data tab
2. Sort by Price (descending)
3. See most expensive trips first

## Customization Options

### Adding More Columns
Edit `src/pages/admin/DataFilters.tsx`:

```typescript
const tripColumns = useMemo<MRT_ColumnDef<Trip>[]>(
  () => [
    // ... existing columns
    {
      accessorKey: 'newField',
      header: 'New Field',
      size: 120,
      filterVariant: 'select', // or 'text', 'range', etc.
    },
  ],
  []
)
```

### Changing Theme Colors
Edit the `darkTheme` in DataFilters.tsx:

```typescript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#YOUR_COLOR', // Change primary color
    },
  },
})
```

### Adding More Tabs
Add new state and table:

```typescript
const [activeTab, setActiveTab] = useState<'trips' | 'users' | 'bookings' | 'newTab'>('trips')

// Add new tab button
<button onClick={() => setActiveTab('newTab')}>New Tab</button>

// Add new table
{activeTab === 'newTab' && (
  <MaterialReactTable columns={newColumns} data={newData} />
)}
```

## Future Enhancements
- [ ] Add Bookings data tab
- [ ] Add date range picker for filtering
- [ ] Add advanced analytics (charts/graphs)
- [ ] Add bulk edit operations
- [ ] Add custom filter presets
- [ ] Add data export scheduling
- [ ] Add comparison view (compare two datasets)
- [ ] Add real-time data updates

## Troubleshooting

### Table Not Loading
- Check if backend API endpoints are accessible
- Check browser console for errors
- Verify admin is logged in

### Filters Not Working
- Ensure column `accessorKey` matches data property
- Check filter variant is appropriate for data type

### Export Not Working
- Check browser allows downloads
- Verify data is loaded before exporting

## Conclusion

The Data Filters feature provides powerful filtering, sorting, grouping, and export capabilities for both trips and users data. It uses Material React Table which is industry-standard and highly customizable.

**Access it at**: `/admin/data-filters` 🎉
