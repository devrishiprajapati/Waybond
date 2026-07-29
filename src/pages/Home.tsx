import React from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import TrendingDestinations from "../components/home/TrendingDestinations";
import FeaturedPackages from "../components/home/FeaturedPackages";
import WhyChooseUs from "../components/home/WhyChooseUs";
import LatestBlogs from "../components/home/LatestBlogs";
import TestimonialsSection from "../components/home/TestimonialsSection";
import NewsletterSection from "../components/home/NewsletterSection";

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
      <HeroSection />
      <StatsSection />
      <TrendingDestinations />
      <FeaturedPackages />
      <WhyChooseUs />
      <LatestBlogs />
      <TestimonialsSection />
      {/* <NewsletterSection /> */}
    </div>
  );
}
