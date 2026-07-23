export const heroSlides = [
  {
    image: '/assets/beaut.jpg',
    title: 'From Miles To Memories',
    subtitle: 'Ahmedabad\'s most authentic travel community crafting memories that stay with you forever.'
  },
  {
    image: '/assets/ERELA.jpg',
    title: 'Explore God\'s Own Country',
    subtitle: 'Journey through the tranquil backwaters and misty hills of Kerala.'
  },
  {
    image: '/assets/meghaa.jpg',
    title: 'SERENE MEGHALAYA',
    subtitle: 'Soak into the beauty and serenity of meghalaya.'
  },
  {
    image: '/assets/tains.jpg',
    title: 'Himachal Mystique',
    subtitle: 'Venture into the rugged heart of the Himalayas with our local captain experts.'
  },
  {
    image: '/assets/kashmir.jpg',
    title: 'Kashmir Beauty',
    subtitle: 'Luxury villa stays and spiritual awakenings in the heart of Kashmir valley.'
  }
];

export const getWhatsAppLink = (message = "Hi Infi Yatra! I'd like to plan a trip.") => {
  const phoneNumber = '919601793485';
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
