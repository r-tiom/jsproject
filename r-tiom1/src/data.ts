import { Beat } from './types';

export const INITIAL_BEATS: Beat[] = [
  {
    id: 'b1',
    title: 'Nightcrawler',
    genre: 'Trap',
    bpm: 140,
    key: 'G Minor',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Streamable instrumental synth-loop
    tags: ['808', 'Heavy', 'Dark', 'Metro Boomin'],
    prices: {
      mp3: 29,
      wav: 49,
      trackout: 99,
      exclusive: 499
    },
    isSoldExclusive: false,
    isFeatured: true,
    plays: 342,
    createdAt: '2026-05-15T12:00:00Z',
    videoUrl: 'https://www.youtube.com/embed/S_7iX6O_69o'
  },
  {
    id: 'b2',
    title: 'Eclipse',
    genre: 'Drill',
    bpm: 142,
    key: 'D# Minor',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['Sliding Bass', 'UK Drill', 'Violin', 'Pop Smoke'],
    prices: {
      mp3: 35,
      wav: 55,
      trackout: 119,
      exclusive: 599
    },
    isSoldExclusive: false,
    isFeatured: true,
    plays: 289,
    createdAt: '2026-05-18T15:30:00Z',
    videoUrl: 'https://www.youtube.com/embed/SgTCo0b9X94'
  },
  {
    id: 'b3',
    title: 'Tokyo Drift',
    genre: 'Hip Hop',
    bpm: 92,
    key: 'C Minor',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    tags: ['Boom Bap', 'Flute', 'Lo-Fi', 'Wu-Tang'],
    prices: {
      mp3: 25,
      wav: 45,
      trackout: 89,
      exclusive: 399
    },
    isSoldExclusive: false,
    isFeatured: false,
    plays: 156,
    createdAt: '2026-05-20T10:45:00Z',
    videoUrl: 'https://www.youtube.com/embed/W6bI4W1Wnfk'
  },
  {
    id: 'b4',
    title: 'Sunset Boulevard',
    genre: 'R&B / Trap-Soul',
    bpm: 115,
    key: 'F Major',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    tags: ['Rhodes', 'Chords', 'Vocal Chops', 'Bryson Tiller'],
    prices: {
      mp3: 29,
      wav: 49,
      trackout: 99,
      exclusive: 449
    },
    isSoldExclusive: false,
    isFeatured: true,
    plays: 521,
    createdAt: '2026-05-10T09:15:00Z',
    videoUrl: 'https://www.youtube.com/embed/nUbe8Z8HovE'
  },
  {
    id: 'b5',
    title: 'Supernova',
    genre: 'Synthwave',
    bpm: 120,
    key: 'A Minor',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    tags: ['80s', 'Retro', 'Stranger Things', 'Synthesizer'],
    prices: {
      mp3: 24,
      wav: 44,
      trackout: 79,
      exclusive: 349
    },
    isSoldExclusive: false,
    isFeatured: false,
    plays: 94,
    createdAt: '2026-05-22T18:00:00Z',
    videoUrl: 'https://www.youtube.com/embed/4xDzrJKXOOY'
  },
  {
    id: 'b6',
    title: 'Grave Digger',
    genre: 'Trap',
    bpm: 133,
    key: 'E Minor',
    coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=500&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    tags: ['Aggressive', 'Brass', 'Hard', 'Wondagurl'],
    prices: {
      mp3: 35,
      wav: 59,
      trackout: 129,
      exclusive: 649
    },
    isSoldExclusive: false,
    isFeatured: false,
    plays: 407,
    createdAt: '2026-05-05T14:20:00Z',
    videoUrl: 'https://www.youtube.com/embed/a7Sg-HCHGhs'
  }
];

export const LICENSE_INFO = [
  {
    type: 'mp3' as const,
    name: 'Basic MP3 License',
    description: 'High-quality MP3 file. Suitable for non-commercial and basic streaming options.',
    fileFormat: '320kbps MP3',
    terms: 'Up to 10,000 streams, non-exclusive usage rights.'
  },
  {
    type: 'wav' as const,
    name: 'Standard WAV License',
    description: 'Lossless WAV file (24-bit). Excellent depth, recommended for commercial and single releases.',
    fileFormat: '24-bit Lossless WAV',
    terms: 'Up to 50,000 streams, professional radio-ready mix.'
  },
  {
    type: 'trackout' as const,
    name: 'Stems (Trackout) License',
    description: 'Includes WAV track stems for maximum control! Best for custom arranging, editing, and professional mixing.',
    fileFormat: 'WAV Track stems + WAV Master',
    terms: 'Up to 500,000 streams, perfect for vocal integration and studio mixing.'
  },
  {
    type: 'exclusive' as const,
    name: 'Exclusive Ownership',
    description: 'Complete exclusivity. The beat is fully yours and is marked as sold out. Unbounded streams, full contract transfer.',
    fileFormat: 'WAV + Trackout + PDF Contract',
    terms: 'Unlimited commercial use, legal owner transfer, instant removal from our catalog storefront.'
  }
];
