import { getWhatsAppLink } from './data';

export interface Trip {
  id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  duration: string;
  category: string;
  experience: 'monsoon' | 'weekend' | 'road' | 'snow';
  difficulty: 'Easy' | 'Medium' | 'Difficult';
  image: string;
  link: string;
  description: string;
  images: string[];
  videoThumbnail?: string;
  groupSize: string;
  nextBatch: string;
  departureDates: string[];
  highlights: string[];
  captain: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    rating: number;
    trips: number;
  };
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  pdfUrl?: string;
}

const DEFAULT_CAPTAIN = {
  name: 'Captain Rohan Shah',
  role: 'Lead Expedition Specialist',
  bio: 'Expert in high-altitude trekking and local storytelling.',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  rating: 5.0,
  trips: 45
};

export const ALL_TRIPS: Trip[] = [
  {
    id: 1,
    title: 'Spiti Valley Expedition',
    location: 'Shimla, Kaza, Manali',
    price: '19,999',
    rating: 4.8,
    reviews: 245,
    duration: '8 Days',
    category: 'Adventure',
    experience: 'road',
    difficulty: 'Difficult',
    image: '/assets/spiti.jpg',
    link: '/spiti-valley',
    description: 'Journey through the rugged landscapes of Spiti Valley. Drive along the Indo-Tibetan highway, visit ancient monasteries, and camp under the starry sky at Chandratal Lake.',
    images: [
      '/assets/spiti.jpg'
    ],
    groupSize: '12-15 Persons',
    nextBatch: 'May 15, 2026',
    departureDates: ['2026-08-05', '2026-08-12', '2026-08-19', '2026-08-26', '2026-09-02', '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30'],
    highlights: ['Key Monastery Visit', 'Chandratal Lake Camping', 'Kibber Village', 'Kunzum Pass'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Arrival in Shimla & Drive to Narkanda', description: 'Meet your group and start the beautiful drive through pine forests.' },
      { day: 2, title: 'Narkanda to Chitkul/Sangla', description: 'Drive to the last Indian village before the Tibet border, breathing in the fresh mountain air.' },
      { day: 3, title: 'Chitkul to Kalpa', description: 'Witness the majestic Kinnaur Kailash range from the beautiful village of Kalpa.' },
      { day: 4, title: 'Kalpa to Kaza', description: 'Cross into the barren landscapes of Spiti, visiting the Nako Lake and Tabo Monastery en route.' },
      { day: 5, title: 'Kaza Local Sightseeing', description: 'Visit Key Monastery, the high-altitude villages of Kibber, Hikkim (highest post office), and Komic.' },
      { day: 6, title: 'Kaza to Chandratal', description: 'Drive over the mighty Kunzum Pass and camp near the crescent-shaped Chandratal Lake.' },
      { day: 7, title: 'Chandratal to Manali', description: 'Off-roading experience over the Rohtang Pass down into the lush Kullu Valley.' },
      { day: 8, title: 'Departure from Manali', description: 'Trip ends with a lifetime of memories.' }
    ]
  },
  {
    id: 2,
    title: 'Leh Ladakh Expedition',
    location: 'Leh, Nubra, Pangong',
    price: '24,999',
    rating: 4.9,
    reviews: 412,
    duration: '7 Days',
    category: 'Adventure',
    experience: 'road',
    difficulty: 'Difficult',
    image: '/assets/himalayas-bg.jpg',
    link: '/leh-ladakh',
    description: 'Experience the ultimate road trip to the Land of High Passes. Marvel at the changing colors of Pangong Tso, ride camels in Nubra Valley, and conquer Khardung La.',
    images: [
      '/assets/himalayas-bg.jpg'
    ],
    groupSize: '10-15 Persons',
    nextBatch: 'Jun 10, 2026',
    departureDates: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28'],
    highlights: ['Khardung La Pass', 'Pangong Tso Lake', 'Double-Humped Camel Ride', 'Shanti Stupa'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Arrival in Leh', description: 'Acclimatize to the high altitude. Visit Shanti Stupa and Leh Palace in the evening.' },
      { day: 2, title: 'Leh to Nubra Valley', description: 'Drive over Khardung La, one of the highest motorable roads. Enjoy the sand dunes in Hunder.' },
      { day: 3, title: 'Turtuk Excursion', description: 'Day trip to the breathtaking Turtuk village near the LoC, experiencing Balti culture.' },
      { day: 4, title: 'Nubra to Pangong Tso', description: 'Drive alongside the Shyok river to reach the magnificent blue waters of Pangong Lake.' },
      { day: 5, title: 'Pangong to Leh', description: 'Wake up to a beautiful sunrise at the lake, then drive back to Leh via Chang La.' },
      { day: 6, title: 'Local Sightseeing', description: 'Explore Magnetic Hill, Pathar Sahib Gurudwara, and the Hall of Fame.' },
      { day: 7, title: 'Departure', description: 'Fly out of Leh with incredible Himalayan memories.' }
    ]
  },
  {
    id: 3,
    title: 'Kashmir Winter Wonderland',
    location: 'Srinagar, Gulmarg, Pahalgam',
    price: '19,499',
    rating: 4.9,
    reviews: 320,
    duration: '6 Days',
    category: 'Nature',
    experience: 'snow',
    difficulty: 'Medium',
    image: '/assets/kashmir.jpg',
    link: '/kashmir',
    description: 'Step into paradise on earth. Sail on the tranquil Dal Lake in a Shikara, experience the thrill of the Gulmarg Gondola, and wander through the scenic valleys of Pahalgam.',
    images: [
      '/assets/kashmir.jpg'
    ],
    groupSize: '10-12 Persons',
    nextBatch: 'Dec 20, 2026',
    departureDates: ['2026-12-10', '2026-12-15', '2026-12-20', '2026-12-27', '2027-01-03', '2027-01-10', '2027-01-17', '2027-01-24', '2027-01-31'],
    highlights: ['Houseboat Stay', 'Gulmarg Gondola Ride', 'Betaab Valley', 'Dal Lake Shikara Ride'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Arrival in Srinagar', description: 'Check into a traditional houseboat. Evening Shikara ride on the Dal Lake.' },
      { day: 2, title: 'Srinagar to Gulmarg', description: 'Travel to the meadow of flowers. Take the famous Gondola cable car ride to Apharwat peak.' },
      { day: 3, title: 'Gulmarg to Pahalgam', description: 'Drive through saffron fields and apple orchards to reach the Valley of Shepherds.' },
      { day: 4, title: 'Explore Pahalgam', description: 'Visit the stunning Betaab Valley, Aru Valley, and Chandanwari.' },
      { day: 5, title: 'Pahalgam to Srinagar', description: 'Return to Srinagar. Visit the beautiful Mughal Gardens and local markets.' },
      { day: 6, title: 'Departure', description: 'Bid farewell to the heavenly valley of Kashmir.' }
    ]
  },
  {
    id: 4,
    title: 'Backpacking Meghalaya',
    location: 'Shillong, Cherrapunji, Dawki',
    price: '17,999',
    rating: 4.7,
    reviews: 189,
    duration: '6 Days',
    category: 'Backpacking',
    experience: 'monsoon',
    difficulty: 'Medium',
    image: '/assets/meghaa.jpg',
    link: '/meghalaya',
    description: 'Dive into the abode of clouds. Trek to the magical living root bridges, explore the deepest caves, and boat on the crystal-clear waters of the Umngot River.',
    images: [
      '/assets/meghaa.jpg'
    ],
    groupSize: '10-15 Persons',
    nextBatch: 'Sep 10, 2026',
    departureDates: ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-09-07', '2026-09-14', '2026-09-21'],
    highlights: ['Double Decker Root Bridge', 'Dawki River Boating', 'Mawsmai Caves', 'Nohkalikai Falls'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Guwahati to Shillong', description: 'Arrive in Guwahati and drive to the Scotland of the East. Visit Umiam Lake en route.' },
      { day: 2, title: 'Shillong to Cherrapunji', description: 'Visit Nohkalikai Falls, Seven Sisters Falls, and explore the Mawsmai limestone caves.' },
      { day: 3, title: 'Nongriat Trek', description: 'Hike down thousands of steps to witness the bio-engineering marvel of the Double Decker Living Root Bridge.' },
      { day: 4, title: 'Cherrapunji to Dawki', description: 'Drive to the Bangladesh border. Enjoy boating on the crystal clear waters of the Umngot River.' },
      { day: 5, title: 'Dawki to Shillong via Krang Suri', description: 'Visit the magical blue waters of Krang Suri waterfalls before heading back to Shillong.' },
      { day: 6, title: 'Departure', description: 'Drive back to Guwahati for your onward journey.' }
    ]
  },
  {
    id: 5,
    title: "Kerala Backwaters & Hills",
    location: 'Munnar, Thekkady, Alleppey',
    price: '18,499',
    rating: 4.8,
    reviews: 210,
    duration: '5 Days',
    category: 'Nature',
    experience: 'monsoon',
    difficulty: 'Easy',
    image: '/assets/kerelabeach.jpg',
    link: '/kerala',
    description: 'A perfect blend of serene backwaters, lush tea gardens, and rich wildlife. Witness the majestic Western Ghats and cruise through the tranquil waters of Alleppey.',
    images: [
      '/assets/kerelabeach.jpg'
    ],
    groupSize: '10-12 Persons',
    nextBatch: 'Nov 05, 2026',
    departureDates: ['2026-08-05', '2026-08-12', '2026-08-19', '2026-08-26', '2026-09-02', '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30'],
    highlights: ['Alleppey Houseboat Stay', 'Munnar Tea Gardens', 'Periyar Wildlife Safari', 'Kathakali Show'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Arrival in Kochi to Munnar', description: 'Drive through winding roads to the beautiful tea hills of Munnar. En route visit Cheeyappara Waterfalls.' },
      { day: 2, title: 'Munnar Sightseeing', description: 'Explore Eravikulam National Park, Mattupetty Dam, and the Tea Museum.' },
      { day: 3, title: 'Munnar to Thekkady', description: 'Travel to Periyar. Enjoy an elephant safari and an authentic spice plantation tour.' },
      { day: 4, title: 'Thekkady to Alleppey', description: 'Board a traditional house-boat. Sail through the palm-fringed backwaters and enjoy Kerala cuisine.' },
      { day: 5, title: 'Departure', description: 'Drive back to Kochi for your departure flight.' }
    ]
  },
  {
    id: 6,
    title: 'Andaman Tropical Escape',
    location: 'Port Blair, Havelock, Neil Island',
    price: '34,999',
    rating: 5.0,
    reviews: 145,
    duration: '7 Days',
    category: 'Beach',
    experience: 'weekend',
    difficulty: 'Easy',
    image: '/assets/andaman.jpg',
    link: '/andaman',
    description: 'Unwind on pristine white-sand beaches and dive into crystal clear waters. Discover the rich marine life of the Andaman Sea and the historical significance of Port Blair.',
    images: [
      '/assets/andaman.jpg'
    ],
    groupSize: '8-12 Persons',
    nextBatch: 'Jan 12, 2027',
    departureDates: ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'],
    highlights: ['Scuba Diving', 'Radhanagar Beach Sunset', 'Cellular Jail', 'Island Hopping'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [
      { day: 1, title: 'Arrival at Port Blair', description: 'Visit the historic Cellular Jail and attend the spectacular Light and Sound show.' },
      { day: 2, title: 'Port Blair to Havelock', description: 'Ferry to Havelock Island. Relax at the world-famous Radhanagar Beach.' },
      { day: 3, title: 'Elephant Beach Excursion', description: 'Enjoy snorkeling or scuba diving to witness vibrant coral reefs and marine life.' },
      { day: 4, title: 'Havelock to Neil Island', description: 'Take a ferry to the serene Neil Island. Watch a beautiful sunset at Laxmanpur Beach.' },
      { day: 5, title: 'Explore Neil Island', description: 'Visit the Natural Bridge formation and the pristine Bharatpur Beach.' },
      { day: 6, title: 'Return to Port Blair', description: 'Ferry back to the capital. Spend the evening shopping for souvenirs.' },
      { day: 7, title: 'Departure', description: 'Leave with a sun-kissed glow and beautiful memories.' }
    ]
  },
  {
    id: 7,
    title: 'Bali Essence Escape',
    location: 'Indonesia',
    price: '54,999',
    rating: 4.9,
    reviews: 350,
    duration: '8 Days',
    category: 'Honeymoon',
    experience: 'weekend',
    difficulty: 'Easy',
    image: '/assets/bali.jpg',
    link: '/bali',
    description: 'A romantic getaway to the island of gods. Pristine beaches and vibrant culture.',
    images: ['/assets/bali.jpg'],
    groupSize: '2-4 Persons',
    nextBatch: 'Sept 10, 2026',
    departureDates: ['2026-09-10', '2026-09-17', '2026-09-24', '2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29'],
    highlights: ['Beach Dinners', 'Temple Tours'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [{ day: 1, title: 'Ubud Arrival', description: 'Welcome to Bali.' }]
  },
  {
    id: 8,
    title: 'Thai Island Perfection',
    location: 'Phuket & Krabi',
    price: '48,999',
    rating: 4.8,
    reviews: 156,
    duration: '7 Days',
    category: 'Beach',
    experience: 'weekend',
    difficulty: 'Easy',
    image: '/assets/thai.jpg',
    link: '#',
    description: 'Explore the stunning limestone cliffs and crystal clear waters of Thailand.',
    images: ['/assets/thai.jpg'],
    groupSize: '8-10 Persons',
    nextBatch: 'Dec 12, 2026',
    departureDates: ['2026-11-07', '2026-11-14', '2026-11-21', '2026-11-28', '2026-12-05', '2026-12-12', '2026-12-19', '2026-12-26'],
    highlights: ['Island Hopping', 'Night Markets'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [{ day: 1, title: 'Phuket Check-in', description: 'Patong beach evening.' }]
  },
  {
    id: 9,
    title: 'Seychelles Paradise',
    location: 'Mahé & Praslin',
    price: '1,24,999',
    rating: 5.0,
    reviews: 42,
    duration: '9 Days',
    category: 'Luxury',
    experience: 'weekend',
    difficulty: 'Easy',
    image: '/assets/seychelles.jpg',
    link: '#',
    description: 'Luxury island getaway featuring the most beautiful beaches in the world.',
    images: ['/assets/seychelles.jpg'],
    groupSize: '4-6 Persons',
    nextBatch: 'Jan 15, 2027',
    departureDates: ['2026-12-15', '2026-12-22', '2026-12-29', '2027-01-05', '2027-01-12', '2027-01-19', '2027-01-26'],
    highlights: ['Island Cruises', 'Marine Park'],
    captain: DEFAULT_CAPTAIN,
    itinerary: [{ day: 1, title: 'Seychelles Arrival', description: 'Victoria city tour.' }]
  }
];

export const CATEGORIES = ['Adventure', 'Beach', 'Luxury', 'Nature', 'Honeymoon', 'Backpacking'];

export const getTripWhatsAppLink = (tripTitle: string) =>
  getWhatsAppLink(`Hi Infi Yatra! I'm interested in the ${tripTitle} package.`);
