export type StayRate = {
  weekday: number;
  weekend: number;
  capacity: number;
  timeRange: string;
};

export type VillaData = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  coverImage: string;
  heroImage: string;
  thumbnails: string[];
  galleryImages: string[];
  capacity: { min: number; max: number; base: number };
  location: string;
  highlights: string[];
  amenities: {
    outdoor: string[];
    indoor: string[];
    kitchen: string[];
    spaces: string[];
  };
  rates: {
    dayStay: StayRate;
    nightStay: StayRate;
    overnight: StayRate;
  };
  contact: {
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
  };
};

export const villas: VillaData[] = [
  {
    id: 'villa-serena',
    name: 'Villa Serena',
    tagline: 'A peaceful retreat for families and groups.',
    description:
      'A lush private villa surrounded by nature — complete with pool, multiple bedrooms, and event-ready spaces for up to 20 guests.',
    longDescription:
      'Villa Serena is a fully private property designed for meaningful gatherings. Whether you are celebrating a milestone, reconnecting with family, or unwinding with your closest friends, every corner of the villa is yours — no shared spaces, no strangers.',
    coverImage:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1615529162924-f8605388465d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=600&q=80',
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1615529162924-f8605388465d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    ],
    capacity: { min: 2, max: 20, base: 10 },
    location: 'Nusa Coastline, Bali, Indonesia',
    highlights: ['Private Pool', '3 Bedrooms', 'Events Ready', 'Full Kitchen'],
    amenities: {
      outdoor: [
        'Private Swimming Pool',
        'Garden Lounge',
        'Covered Terrace',
        'Outdoor Dining Area',
        'BBQ Station',
        'Poolside Sunbeds',
      ],
      indoor: [
        'Air-Conditioned Bedrooms',
        'Smart TV & Streaming',
        'High-Speed WiFi',
        'Bluetooth Speaker System',
        'Working Desk Area',
      ],
      kitchen: [
        'Full Kitchen Setup',
        'Refrigerator & Freezer',
        'Microwave & Oven',
        'Dining Set for 10',
        'Complete Cookware & Utensils',
        'Coffee & Tea Station',
      ],
      spaces: [
        'Master Bedroom (King Bed)',
        'Guest Bedroom 1 (Queen Bed)',
        'Guest Bedroom 2 (Twin Beds)',
        'Open Living Area',
        'Events Hall / Function Space',
        'Private Bathroom × 3',
      ],
    },
    rates: {
      dayStay: {
        weekday: 5000,
        weekend: 6500,
        capacity: 20,
        timeRange: '8:00 AM – 5:00 PM',
      },
      nightStay: {
        weekday: 4500,
        weekend: 5500,
        capacity: 20,
        timeRange: '8:00 PM – 5:00 AM',
      },
      overnight: {
        weekday: 8000,
        weekend: 10000,
        capacity: 20,
        timeRange: '2:00 PM – 12:00 PM (next day)',
      },
    },
    contact: {
      phone: '+63 912 345 6789',
      email: 'stay@villaserena.ph',
      facebook: 'facebook.com/villaserena',
      instagram: '@villaserena',
    },
  },
  {
    id: 'villa-verde',
    name: 'Villa Verde',
    tagline: 'Lush greenery, total privacy, perfect memories.',
    description:
      'Tucked in a quiet garden setting — Villa Verde is an intimate private estate with a natural pool and curated spaces for groups up to 15 guests.',
    longDescription:
      'Villa Verde is a nature-immersed private estate designed for those who seek stillness without sacrificing comfort. From the lush garden pool to the fully equipped kitchen, every space is crafted for your group\'s exclusive use. No other guests. No interruptions.',
    coverImage:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=600&q=80',
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    ],
    capacity: { min: 2, max: 15, base: 10 },
    location: 'Garden Estate, Bali, Indonesia',
    highlights: ['Private Pool', '2 Bedrooms', 'Garden View', 'Full Kitchen'],
    amenities: {
      outdoor: [
        'Private Pool with Garden View',
        'Al Fresco Dining',
        'Hammock Garden',
        'Outdoor Shower',
        'Fire Pit Lounge',
      ],
      indoor: [
        'Air-Conditioned Bedrooms',
        'Smart TV & Streaming',
        'High-Speed WiFi',
        'Cozy Reading Nook',
        'Board Games & Entertainment',
      ],
      kitchen: [
        'Full Kitchen Setup',
        'Refrigerator & Bar Fridge',
        'Breakfast Bar for 6',
        'Complete Utensils',
        'Rice Cooker & Kettle',
      ],
      spaces: [
        'Master Bedroom (King Bed)',
        'Guest Bedroom (Queen Bed)',
        'Garden Living Room',
        'Private Terrace',
        'Shared Bathroom × 2',
      ],
    },
    rates: {
      dayStay: {
        weekday: 4000,
        weekend: 5500,
        capacity: 15,
        timeRange: '8:00 AM – 5:00 PM',
      },
      nightStay: {
        weekday: 3500,
        weekend: 4500,
        capacity: 15,
        timeRange: '8:00 PM – 5:00 AM',
      },
      overnight: {
        weekday: 6500,
        weekend: 8500,
        capacity: 15,
        timeRange: '2:00 PM – 12:00 PM (next day)',
      },
    },
    contact: {
      phone: '+63 917 876 5432',
      email: 'stay@villaverde.ph',
      facebook: 'facebook.com/villaverdeph',
      instagram: '@villaverde.ph',
    },
  },
];
