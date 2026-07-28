import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, MessageCircle, Youtube } from "lucide-react";
import { getWhatsAppLink } from "../lib/data";

const categoryGroups = [
  {
    title: "Trending",
    links: [
      { label: "Spiti & Ladakh", to: "/discover?region=himalayas" },
      { label: "Kashmir Winter", to: "/discover?experience=snow" },
      { label: "Backpacking Meghalaya", to: "/discover?region=northeast" },
      { label: "Island Escapes", to: "/discover?region=islands" },
    ],
  },
  {
    title: "Region",
    links: [
      { label: "Himalayas", to: "/discover?region=himalayas" },
      { label: "North East", to: "/discover?region=northeast" },
      { label: "South India", to: "/discover?region=south-india" },
      { label: "Island Getaways", to: "/discover?region=islands" },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "Adventure", to: "/discover?category=Adventure" },
      { label: "Nature", to: "/discover?category=Nature" },
      { label: "Backpacking", to: "/discover?category=Backpacking" },
      { label: "Beach Escapes", to: "/discover?category=Beach" },
    ],
  },
  {
    title: "Duration",
    links: [
      { label: "Weekend Getaways", to: "/discover?duration=weekend" },
      { label: "Week-long Trips", to: "/discover?duration=week-long" },
      { label: "Long Expeditions", to: "/discover?duration=extended" },
      { label: "All Adventures", to: "/discover" },
    ],
  },
];

const Footer = () => {
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
    { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
    { label: "YouTube", href: "https://www.youtube.com/", icon: Youtube },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
    { label: "WhatsApp", href: getWhatsAppLink("Hi WayBond! I'd like to join the community."), icon: MessageCircle },
  ];

  return (
    <footer className="bg-white text-white pt-24 pb-8 relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 liquid-glass-grain pointer-events-none"></div>
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10 mb-16 md:mb-20">
        <div className="liquid-glass-dark rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tighter mb-8 md:mb-10">Explore by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {categoryGroups.map((group, index) => (
              <div key={group.title} className={`min-w-0 ${index > 0 ? 'lg:border-l lg:border-slate-200 lg:pl-7 xl:pl-10' : ''} ${index < 2 ? 'sm:border-b sm:border-slate-200 sm:pb-8 lg:border-b-0 lg:pb-0' : ''} ${index % 2 === 1 ? 'sm:pl-7 lg:pl-7 xl:pl-10' : ''}`}>
                <h3 className="text-secondary text-sm font-black mb-4 border-b border-secondary/25 pb-2 w-fit">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map(link => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-sm font-semibold text-white/60 hover:text-secondary transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="space-y-6">
          <h3 className="text-3xl font-display font-black text-white tracking-tighter liquid-text">
            WAY
            <span className="text-secondary text-2xl uppercase ml-1">Bond</span>
          </h3>
          <p className="text-white/40 leading-relaxed text-sm italic font-medium">
            Ahmedabad's premier community travel platform. Connecting curious
            travelers with authentic local and international experiences since
            2026.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">
            Quick Links
          </h4>
          <ul className="space-y-4 text-white/50 text-xs font-bold uppercase tracking-widest">
            <li>
              <a
                href="/discover"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                Trips & Tours
              </a>
            </li>
            <li>
              <a
                href="/wishlist"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                Dream Vault
              </a>
            </li>
            <li>
              <Link
                to="/testimonials"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                Testimonials / Reviews
              </Link>
            </li>
            <li>
              <a
                href={getWhatsAppLink(`Hi WayBond! I'd like to get in touch regarding my trip. Can you help me?`)}
                target="_blank"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">
            Support & Safety
          </h4>
          <ul className="space-y-4 text-white/50 text-xs font-bold uppercase tracking-widest">
            <li>
              <a
                href={getWhatsAppLink(
                  "Hi WayBond! I need some help with my trip. Could you assist me?",
                )}
                target="_blank"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                24/7 SUPPORT{" "}
              </a>
            </li>
            <li>
              <a
                href="/safety-guidelines"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                SAFETY GUIDELINES
              </a>
            </li>
            <li>
              <a
                href="/cancellation-refunds"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                CANCELLATION & REFUNDS
              </a>
            </li>
            <li>
              <a
                href="/faqs"
                className="hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>
                TRAVELER FAQS
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">
            Join the Community
          </h4>
          <p className="text-white/40 text-xs mb-5 italic font-medium">
            Follow along for trip updates, stories and new adventures.
          </p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit WayBond on ${label}`}
                title={label}
                className="group grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:bg-secondary hover:text-white hover:shadow-lg hover:shadow-secondary/20"
              >
                <Icon size={19} strokeWidth={2.2} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 mt-24 pt-8 border-t border-white/5 text-center relative z-10">
        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">
          © 2026 WayBond Travels. All rights reserved.{" "}
          <span className="text-secondary/50">
            Designed for Ahmedabad, Built for the World.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
