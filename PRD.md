Goal Description

User Review Required

NOTE



Please review the proposed changes below. We will use react-router-dom for navigation, framer-motion for fluid animations, and lucide-react for icons. The design system will be established in 

tailwind.config.js

. Let me know if you would like me to adjust the color palette or core libraries before we begin.



Proposed Changes

Core Configuration & Design System

We will update the core configuration files to establish the new design system.



[MODIFY] tailwind.config.js

Add custom color palette (Teal: #0D7377, Orange: #FF6B35, Gold: #FFD700).

Add custom font families (Inter, Poppins).

Add custom animations and transitions for aesthetic fluidity.

[MODIFY] src/main.tsx

Wrap the main application in BrowserRouter from react-router-dom.

[MODIFY] infiland.tsx

Remove existing landing page placeholder.

Implement the main layout structure (Navbar + Main Content Area + Footer).

Implement routes for / (Home), /discover (Trip Discovery), /trip/:id (Trip Details), and /dashboard (User Dashboard).

Shared Components

These components will be reused across the application to ensure consistency.



[NEW] src/components/Navbar.tsx

Sticky modern navigation with visually appealing mega-menus and mobile responsiveness.

[NEW] src/components/Footer.tsx

Comprehensive footer with links, trust badges, and newsletter signup.

Page Views

[NEW] src/pages/Home.tsx

Hero Section: Dynamic video/image background with an AI-powered search bar ("Adventure trip for couples in Himalayas").

Trust Signals: Real-time counters showing travelers, reviews.

Featured Trips: Horizontal scroll or grid of top-rated trips with hover animations.

[NEW] src/pages/Discover.tsx

Multi-filter Sidebar: Filtering by destination, duration, price, activity type, etc.

Trip Cards: Information-dense cards with pricing in INR, highlights, and real-time availability.

Interactive Map: A visual component to display trip locations.

[NEW] src/pages/TripDetails.tsx

Gallery & Video: High-res images and captain intro videos.

Interactive Itinerary: A timeline detailing day-by-day plans.

Captain Profile: Details, rating, and traveler testimonials.

Booking Widget: Sticky UI on desktop for real-time pricing and add-on selection.

[NEW] src/pages/Dashboard.tsx

User Dashboard: Tabs for 'My Trips', 'Wishlist', and 'Settings'.

Verification Plan

Automated Tests

Currently, there is no automated testing suite setup (Jest/Vitest). We will rely on manual visual verification and the local dev server. If desired, we can configure Vitest/React Testing Library in a later phase.



Manual Verification

We will start the Vite dev server (npm run dev) and use the browser subagent (via the browser_subagent tool) to visually verify that:

Routing navigates correctly across Home, Discover, TripDetails, and Dashboard.

The color palette matches the prompt's Teal, Orange, and Golden Yellow.

Hover states and Framer Motion fluid animations work smoothly on the trip cards and hero search bar.

The application layout scales properly from desktop to mobile viewports.
