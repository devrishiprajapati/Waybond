import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, MessageCircle, Youtube, MapPin, Clock, Phone, Mail } from "lucide-react";
import { getWhatsAppLink } from "../lib/data";

const categoryGroups = [
  {
    title: "Trending",
    links: [
      { label: "Kedarkantha Trek", to: "/discover?trending=kedarkantha" },
      { label: "Valley of Flowers", to: "/discover?trending=valley-of-flowers" },
      { label: "Hampta Pass", to: "/discover?trending=hampta-pass" },
      { label: "Sar Pass Trek", to: "/discover?trending=sar-pass" },
    ],
  },
  {
    title: "Region",
    links: [
      { label: "Himalayas", to: "/discover?region=himalayas" },
      { label: "Himachal Pradesh", to: "/discover?region=himachal" },
      { label: "Uttarakhand", to: "/discover?region=uttarakhand" },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "High Altitude Trek", to: "/discover?experience=high-altitude" },
      { label: "Snow Trek", to: "/discover?experience=snow" },
      { label: "Backpacking", to: "/discover?category=Backpacking" },
      { label: "Camping", to: "/discover?experience=camping" },
    ],
  },
  {
    title: "Duration",
    links: [
      { label: "Weekend Getaways", to: "/discover?duration=weekend" },
      { label: "Long Expeditions", to: "/discover?duration=extended" },
      { label: "Day Hikes", to: "/discover?duration=day" },
      { label: "Summer Camps", to: "/discover?duration=summer" },
    ],
  },
];

const Footer = () => {
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
    // { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
    // { label: "YouTube", href: "https://www.youtube.com/", icon: Youtube },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
    { label: "WhatsApp", href: getWhatsAppLink("Hi WayBond! I'd like to join the community."), icon: MessageCircle },
  ];

  return (
    <footer className="bg-slate-900 text-slate-100 pt-24 pb-8 relative overflow-hidden border-t border-slate-700">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10 mb-16 md:mb-20">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-700 p-6 sm:p-8 md:p-10 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight mb-6 md:mb-8">Events by Category</h2>
          
          {/* Mobile: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categoryGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <h3 className="text-secondary text-sm md:text-base font-bold mb-3 md:mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-2 md:space-y-2.5">
                  {group.links.map(link => (
                    <li key={link.label}>
                      <Link 
                        to={link.to} 
                        className="text-xs md:text-sm font-medium text-slate-300 hover:text-secondary transition-colors block"
                      >
                        {link.label}
                      </Link>
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
          <h3 className="text-3xl font-sans font-black text-slate-100 tracking-tighter">
            WAY
            <span className="text-secondary text-2xl uppercase ml-1">Bond</span>
          </h3>
          <p className="text-slate-300 leading-relaxed text-sm italic font-medium">
            Ahmedabad's premier community travel platform. Connecting curious
            travelers with authentic local and international experiences since
            2026.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 text-secondary">
            Quick Links
          </h4>
          <ul className="space-y-4 text-slate-300 text-xs font-bold uppercase tracking-widest">
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
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 text-secondary">
            Support & Safety
          </h4>
          <ul className="space-y-4 text-slate-300 text-xs font-bold uppercase tracking-widest">
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
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-secondary">
            Contact
          </h4>
          <ul className="space-y-4 text-slate-300 text-xs font-medium">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
              <span>101, University Plaza, Vijay Cross Roads, Navrangpura, Ahmedabad, Gujarat 380009</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={16} className="text-secondary shrink-0 mt-0.5" />
              <span>Mon to Sat • 10 AM to 7 PM</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="text-secondary shrink-0 mt-0.5" />
              <a href="tel:+919099400699" className="hover:text-secondary transition-colors">
                +91 90994 00699
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="text-secondary shrink-0 mt-0.5" />
              <a href="tel:+919913800699" className="hover:text-secondary transition-colors">
                +91 99138 00699
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="text-secondary shrink-0 mt-0.5" />
              <a href="mailto:info@invinciblengo.org" className="hover:text-secondary transition-colors">
                info@invinciblengo.org
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Google Maps Section */}
      <section className="w-full relative z-10 mt-16 md:mt-20">
        <div className="max-w-[1400px] md:max-w-none mx-auto px-6 md:px-0">
          <div className="bg-slate-800 rounded-2xl md:rounded-none border border-slate-700 md:border-0 md:border-y p-4 sm:p-6 md:py-8">
            <h3 className="text-lg md:text-xl font-sans font-black text-slate-100 tracking-tighter mb-4 md:px-12 lg:px-20">Find Us</h3>
            <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg md:px-12 lg:px-20">
              <iframe
                src="https://maps.google.com/maps?q=23.063877909238336,72.67752775052084&hl=en&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="WayBond Location"
                className="w-full h-full rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 mt-24 pt-8 border-t border-slate-700 text-center relative z-10">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
          © 2026 WayBond Travels. All rights reserved.{" "}
          <span className="text-secondary">
            Designed for Ahmedabad, Built for the World.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
