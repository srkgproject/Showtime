export enum UserRole {
  USER = 'USER',
  CREATOR_PRODUCTION = 'CREATOR_PRODUCTION',
  CREATOR_THEATRE = 'CREATOR_THEATRE',
  ADMIN = 'ADMIN'
}

export enum MovieType {
  NOW_SHOWING = 'NOW_SHOWING',
  OTT = 'OTT',
  UPCOMING = 'UPCOMING'
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  banner: string;
  description: string;
  rating: number;
  genre: string[];
  duration: string;
  language: string[];
  cast: string[];
  type: MovieType;
  priceBuy?: number;
  priceRent?: number;
  theatreIds?: string[];
  trailerUrl?: string;
  releaseDate?: string;
  releasePlatform?: 'THEATRE' | 'OTT';
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  screens: number;
  location: string;
}

export interface ShowTime {
  id: string;
  movieId: string;
  theatreId: string;
  time: string;
  date: string;
  price: number;
  screen: string;
}

export interface Ticket {
  id: string;
  userId: string;
  showTimeId: string;
  movieTitle: string;
  theatreName: string;
  seats: string[];
  totalAmount: number;
  qrCode: string;
  date: string;
  time: string;
  status: 'ACTIVE' | 'USED';
}

export interface User {
  id: string;
  name: string;
  email: string;
  gender?: 'Male' | 'Female' | 'Other';
  role: UserRole;
  profilePic?: string;
  coins: number;
  isSubscribed: boolean;
  library: string[];
  rentals: { movieId: string; expiry: number }[];
  watchlist: string[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  timestamp: number;
}