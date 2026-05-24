export type UserRole = 'admin' | 'buyer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  purchasedBeats: string[]; // List of beat IDs
}

export type LicenseType = 'mp3' | 'wav' | 'trackout' | 'exclusive';

export interface LicenseOption {
  type: LicenseType;
  name: string;
  description: string;
  fileFormat: string;
  price: number;
}

export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string; // e.g. "C Minor", "A# Major"
  coverUrl: string;
  audioUrl: string;
  tags: string[];
  prices: {
    mp3: number;
    wav: number;
    trackout: number;
    exclusive: number;
  };
  isSoldExclusive: boolean;
  isFeatured?: boolean;
  plays: number;
  createdAt: string;
  videoUrl?: string; // e.g. YouTube Embed URL or mock visualizer URL
}

export interface CartItem {
  id: string; // unique item id (beatId-licenseType)
  beat: Beat;
  licenseType: LicenseType;
  price: number;
}

export interface Purchase {
  id: string;
  beatId: string;
  beatTitle: string;
  licenseType: LicenseType;
  price: number;
  purchaseDate: string;
  downloadUrl: string;
}

export interface Order {
  id: string;
  userEmail: string;
  items: CartItem[];
  totalAmount: number;
  purchaseDate: string;
}
