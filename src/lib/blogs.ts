export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  category: string;
  date: string;
  readTime: number;
  slug: string;
  tags: string[];
}

export const blogsData: Blog[] = [
  {
    id: "1",
    title: "Hidden Gems of Himachal Pradesh: Beyond the Beaten Path",
    excerpt: "Discover lesser-known destinations in Himachal Pradesh that offer breathtaking views and authentic local experiences.",
    content: `Himachal Pradesh is renowned for its stunning landscapes, ancient temples, and adventure activities. While destinations like Manali and Shimla attract thousands of tourists annually, there are several hidden gems that remain relatively unexplored.

## Trekking to Chanderkhani Pass
The Chanderkhani Pass trek offers a perfect blend of natural beauty and adventure. This 3-day trek takes you through rhododendron forests, alpine meadows, and ancient villages. The views from the pass are absolutely spectacular, especially during spring when the flowers bloom.

## Serene Beauty of Prashar Lake
Prashar Lake, located at 2,615 meters, is a pristine alpine lake surrounded by dense forests. Unlike popular lakes, Prashar remains relatively untouched by mass tourism. The floating pagoda in the lake is a unique attraction that adds to its charm.

## Traditional Villages of Kinnaur
Kinnaur is home to some of the most authentic villages in Himachal. The locals still practice traditional agriculture and maintain their unique culture. The apricot orchards and stunning mountain views make it a photographer's paradise.

## Adventure Activities
Whether you're into trekking, paragliding, or river rafting, these hidden destinations offer incredible opportunities for adventure without the crowds.

Plan your next trip to these unexplored destinations and experience the true essence of Himachal Pradesh.`,
    author: "Raj Patel",
    image: "/assets/himal.jpg",
    category: "Destinations",
    date: "2026-07-20",
    readTime: 5,
    slug: "hidden-gems-himachal-pradesh",
    tags: ["Himachal", "Trekking", "Adventure", "Nature"]
  },
  {
    id: "2",
    title: "Bali on a Budget: Your Complete Travel Guide",
    excerpt: "Experience the magic of Bali without breaking the bank. Tips and tricks for budget-conscious travelers.",
    content: `Bali is one of the most affordable yet incredibly beautiful destinations in Southeast Asia. With proper planning, you can experience luxury experiences on a budget.

## Accommodation Tips
Bali offers a wide range of accommodation options for every budget. Guesthouses and homestays in areas like Ubud and Sanur offer excellent value for money, typically ranging from $10-30 per night.

## Food on a Budget
Street food in Bali is not just affordable but also delicious and authentic. Warung restaurants serve traditional Indonesian cuisine at fraction of restaurant prices. Try Nasi Goreng, Gado-gado, and Satay for an authentic experience.

## Money-Saving Activities
Many of Bali's best attractions are free or low-cost:
- Visit rice terraces in Ubud (free)
- Explore local temples (small donation suggested)
- Swim at public beaches
- Hike to Mount Batur for sunrise

## Transportation
Renting a scooter ($3-5 per day) is the most cost-effective way to explore the island. Public transport is also very affordable.

## Best Time to Visit
The dry season (April-October) offers the best weather and better prices for accommodations during shoulder months.

With these tips, you can enjoy Bali's beauty without spending a fortune.`,
    author: "Sarah Johnson",
    image: "/assets/bali.jpg",
    category: "Budget Travel",
    date: "2026-07-15",
    readTime: 6,
    slug: "bali-budget-guide",
    tags: ["Bali", "Budget", "Asia", "Travel Tips"]
  },
  {
    id: "3",
    title: "The Art of Slow Travel: Why Less is More",
    excerpt: "Learn how slowing down and spending more time in fewer places creates deeper travel experiences.",
    content: `In our fast-paced world, slow travel offers a refreshing alternative to the typical rushed tour itineraries. It's about quality over quantity, depth over distance.

## What is Slow Travel?
Slow travel is a philosophy of spending more time in fewer destinations, allowing you to experience places authentically. Instead of visiting 10 countries in 10 days, slow travel encourages spending 2-3 weeks in one region.

## Benefits of Slow Travel
### Deeper Cultural Understanding
When you stay longer, you move beyond tourist attractions and interact with locals, understand their customs, and appreciate their way of life.

### Cost Savings
Longer stays often mean better accommodation rates and reduced transportation costs. You'll also discover local eateries that are cheaper than tourist restaurants.

### Reduced Travel Fatigue
Constant packing and moving is exhausting. Slow travel reduces this stress and allows you to rest and rejuvenate.

### Better Photography
You get multiple opportunities to capture the same location in different light and weather conditions.

## How to Practice Slow Travel
1. Choose 2-3 destinations for your trip
2. Spend at least 5-7 days in each place
3. Skip some tourist attractions
4. Stay in one accommodation for the entire duration
5. Learn basic local language phrases
6. Eat where locals eat
7. Take public transportation

## Destinations Perfect for Slow Travel
- Tuscany, Italy
- Ubud, Bali
- Chiang Mai, Thailand
- Portuguese Coast
- Japanese countryside

Slow travel isn't about being lazy; it's about being intentional with your time and experiences.`,
    author: "Emma Richards",
    image: "/assets/tree.jpg",
    category: "Travel Philosophy",
    date: "2026-07-10",
    readTime: 7,
    slug: "art-slow-travel",
    tags: ["Slow Travel", "Lifestyle", "Philosophy", "Experience"]
  },
  {
    id: "4",
    title: "Sustainable Travel: Exploring Responsibly",
    excerpt: "Make a positive impact on destinations you visit with these sustainable travel practices.",
    content: `Sustainable travel is about making conscious choices that minimize negative impact on destinations and maximize positive contributions to local communities.

## Environmental Responsibility
Reduce your carbon footprint by choosing eco-friendly accommodations, using public transport, and supporting conservation efforts.`,
    author: "Marcus Green",
    image: "/assets/tree.jpg",
    category: "Sustainable Travel",
    date: "2026-07-05",
    readTime: 4,
    slug: "sustainable-travel-guide",
    tags: ["Sustainability", "Eco-tourism", "Responsibility"]
  },
  {
    id: "5",
    title: "Photography Tips for Travel Blogging",
    excerpt: "Master the art of capturing stunning travel photos with these professional photography tips.",
    content: `Photography is essential for travel blogging and sharing your adventures with others. Here are some tips to improve your travel photography.`,
    author: "Lisa Chen",
    image: "/assets/beaut.jpg",
    category: "Photography",
    date: "2026-06-30",
    readTime: 5,
    slug: "travel-photography-tips",
    tags: ["Photography", "Tips", "Travel", "Blogging"]
  },
  {
    id: "6",
    title: "Adventure Sports in India: Thrills Await",
    excerpt: "From paragliding to river rafting, discover the best adventure sports destinations across India.",
    content: `India offers incredible opportunities for adventure sports enthusiasts. Whether you're looking for adrenaline-pumping activities or peaceful pursuits, India has something for everyone.`,
    author: "Vikram Singh",
    image: "/assets/manali.jpg",
    category: "Adventure",
    date: "2026-06-25",
    readTime: 5,
    slug: "adventure-sports-india",
    tags: ["Adventure", "Sports", "India", "Adrenaline"]
  }
];

export const getLatestBlogs = (count: number = 3): Blog[] => {
  return blogsData.slice(0, count);
};

export const getAllBlogs = (): Blog[] => {
  return blogsData;
};

export const getBlogBySlug = (slug: string): Blog | undefined => {
  return blogsData.find(blog => blog.slug === slug);
};

export const getBlogsByCategory = (category: string): Blog[] => {
  return blogsData.filter(blog => blog.category === category);
};

export const searchBlogs = (query: string): Blog[] => {
  const lowerQuery = query.toLowerCase();
  return blogsData.filter(blog =>
    blog.title.toLowerCase().includes(lowerQuery) ||
    blog.excerpt.toLowerCase().includes(lowerQuery) ||
    blog.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
