import React, { Suspense, lazy } from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from "../components/home/HeroSection";

// Lazy load sections that are below the fold
const TrendingDestinations = lazy(() => import("../components/home/TrendingDestinations"));
const FeaturedPackages = lazy(() => import("../components/home/FeaturedPackages"));
const WhyChooseUs = lazy(() => import("../components/home/WhyChooseUs"));
const LatestBlogs = lazy(() => import("../components/home/LatestBlogs"));
const TestimonialsSection = lazy(() => import("../components/home/TestimonialsSection"));
const NewsletterSection = lazy(() => import("../components/home/NewsletterSection"));
const ContactSocialSection = lazy(() => import("../components/home/ContactSocialSection"));

// Fallback component for lazy loading
const SectionSkeleton = () => (
  <div className="py-24 bg-white">
    <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function Home() {
  return (
    <div className="bg-white">
      <Helmet>
        <title>WAYBOND — Ahmedabad's Premier Travel Community</title>
        <meta name="description" content="Discover meaningful travel experiences with Ahmedabad's most authentic travel community. Curated domestic and international trips led by verified local captains." />
        <meta property="og:title" content="WAYBOND — The Art of Meaningful Travel" />
        <meta property="og:description" content="Curated adventures from the Himalayas to Bali. Join 100K+ travelers." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Above the fold - load immediately */}
      <HeroSection />
      
      {/* Below the fold - lazy load with fallback */}
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingDestinations />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedPackages />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <WhyChooseUs />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LatestBlogs />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ContactSocialSection />
      </Suspense>
{/* 
      <Suspense fallback={<SectionSkeleton />}>
        <NewsletterSection />
      </Suspense> */}
    </div>
  );
}
