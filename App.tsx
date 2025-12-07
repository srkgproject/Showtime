import React, { useState, useContext, createContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { User, Movie, Ticket, UserRole, MovieType, Theatre, ShowTime, Notification } from './types';
import { Button, Modal, MovieCard, TicketCard, SimpleLineChart, SimpleBarChart, Toast, HorizontalScrollContainer } from './components/Shared';
import { getAIRecommendations, getChatbotResponse } from './services/geminiService';

// --- MOCK DATA ---
const MOCK_MOVIES: Movie[] = [
  // NOW SHOWING (Theatres)
  { id: '1', title: 'Cyber Runner 2049', poster: 'https://picsum.photos/300/450?random=1', banner: 'https://picsum.photos/1200/600?random=1', description: 'A futuristic noir thriller.', rating: 4.8, genre: ['Sci-Fi', 'Action'], duration: '2h 45m', language: ['English', 'Hindi'], cast: ['Ryan Gosling', 'Ana de Armas'], type: MovieType.NOW_SHOWING, theatreIds: ['t1', 't2'], trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: '2', title: 'The Lost Kingdom', poster: 'https://picsum.photos/300/450?random=2', banner: 'https://picsum.photos/1200/600?random=2', description: 'An epic adventure.', rating: 4.2, genre: ['Adventure', 'Fantasy'], duration: '2h 10m', language: ['English'], cast: ['Chris Pratt'], type: MovieType.NOW_SHOWING, theatreIds: ['t1'], trailerUrl: '' },
  { id: '8', title: 'Fast X', poster: 'https://picsum.photos/300/450?random=8', banner: 'https://picsum.photos/1200/600?random=8', description: 'The end of the road begins.', rating: 4.5, genre: ['Action'], duration: '2h 21m', language: ['English'], cast: ['Vin Diesel'], type: MovieType.NOW_SHOWING, theatreIds: ['t2', 't3'] },
  { id: '9', title: 'Evil Dead Rise', poster: 'https://picsum.photos/300/450?random=9', banner: 'https://picsum.photos/1200/600?random=9', description: 'Mommy loves you to death.', rating: 4.1, genre: ['Horror'], duration: '1h 36m', language: ['English'], cast: ['Alyssa Sutherland'], type: MovieType.NOW_SHOWING, theatreIds: ['t1'] },
  { id: '10', title: 'Guardians Vol 3', poster: 'https://picsum.photos/300/450?random=10', banner: 'https://picsum.photos/1200/600?random=10', description: 'One last ride.', rating: 4.7, genre: ['Sci-Fi', 'Comedy'], duration: '2h 30m', language: ['English'], cast: ['Chris Pratt'], type: MovieType.NOW_SHOWING, theatreIds: ['t3'] },
  { id: '21', title: 'Oppenheimer', poster: 'https://picsum.photos/300/450?random=21', banner: 'https://picsum.photos/1200/600?random=21', description: 'The story of American scientist J. Robert Oppenheimer.', rating: 4.9, genre: ['Biography', 'Drama'], duration: '3h 00m', language: ['English'], cast: ['Cillian Murphy'], type: MovieType.NOW_SHOWING, theatreIds: ['t1', 't2'] },
  { id: '25', title: 'Mission Impossible 7', poster: 'https://picsum.photos/300/450?random=25', banner: 'https://picsum.photos/1200/600?random=25', description: 'Ethan Hunt returns.', rating: 4.8, genre: ['Action'], duration: '2h 40m', language: ['English'], cast: ['Tom Cruise'], type: MovieType.NOW_SHOWING, theatreIds: ['t1', 't2'] },
  { id: '26', title: 'Barbie', poster: 'https://picsum.photos/300/450?random=26', banner: 'https://picsum.photos/1200/600?random=26', description: 'She is everything.', rating: 4.5, genre: ['Comedy'], duration: '2h 00m', language: ['English'], cast: ['Margot Robbie'], type: MovieType.NOW_SHOWING, theatreIds: ['t3'] },

  // OTT / STREAM ONLINE (Subscription)
  { id: '4', title: 'Comedy Central', poster: 'https://picsum.photos/300/450?random=4', banner: 'https://picsum.photos/1200/600?random=4', description: 'Laugh out loud.', rating: 4.5, genre: ['Comedy'], duration: '1h 30m', language: ['Hindi', 'English'], cast: ['Kevin Hart'], type: MovieType.OTT },
  { id: '11', title: 'Stranger Things', poster: 'https://picsum.photos/300/450?random=11', banner: 'https://picsum.photos/1200/600?random=11', description: 'Hawkins is in danger.', rating: 4.9, genre: ['Sci-Fi', 'Horror'], duration: '50m', language: ['English'], cast: ['Millie Bobby Brown'], type: MovieType.OTT },
  { id: '12', title: 'The Office', poster: 'https://picsum.photos/300/450?random=12', banner: 'https://picsum.photos/1200/600?random=12', description: 'Life at Dunder Mifflin.', rating: 4.8, genre: ['Comedy'], duration: '22m', language: ['English'], cast: ['Steve Carell'], type: MovieType.OTT },
  { id: '13', title: 'Breaking Bad', poster: 'https://picsum.photos/300/450?random=13', banner: 'https://picsum.photos/1200/600?random=13', description: 'Say my name.', rating: 5.0, genre: ['Drama', 'Crime'], duration: '50m', language: ['English'], cast: ['Bryan Cranston'], type: MovieType.OTT },
  { id: '14', title: 'Money Heist', poster: 'https://picsum.photos/300/450?random=14', banner: 'https://picsum.photos/1200/600?random=14', description: 'The greatest heist.', rating: 4.6, genre: ['Action', 'Thriller'], duration: '50m', language: ['Spanish', 'English'], cast: ['Álvaro Morte'], type: MovieType.OTT },
  { id: '22', title: 'Black Mirror', poster: 'https://picsum.photos/300/450?random=22', banner: 'https://picsum.photos/1200/600?random=22', description: 'The dark side of technology.', rating: 4.6, genre: ['Sci-Fi', 'Thriller'], duration: '1h 00m', language: ['English'], cast: ['Various'], type: MovieType.OTT },

  // BUY / RENT
  { id: '3', title: 'Silent Hill: Returns', poster: 'https://picsum.photos/300/450?random=3', banner: 'https://picsum.photos/1200/600?random=3', description: 'Horror returns to the town.', rating: 3.9, genre: ['Horror'], duration: '1h 55m', language: ['English'], cast: ['Unknown'], type: MovieType.OTT, priceBuy: 14.99, priceRent: 4.99 },
  { id: '6', title: 'Romance in Paris', poster: 'https://picsum.photos/300/450?random=6', banner: 'https://picsum.photos/1200/600?random=6', description: 'Love is in the air.', rating: 4.1, genre: ['Romance'], duration: '1h 45m', language: ['English', 'French'], cast: ['Emily Blunt'], type: MovieType.OTT, priceBuy: 12.99, priceRent: 3.99 },
  { id: '15', title: 'John Wick 4', poster: 'https://picsum.photos/300/450?random=15', banner: 'https://picsum.photos/1200/600?random=15', description: 'No way back.', rating: 4.8, genre: ['Action'], duration: '2h 49m', language: ['English'], cast: ['Keanu Reeves'], type: MovieType.OTT, priceBuy: 19.99, priceRent: 5.99 },
  { id: '16', title: 'Super Mario Bros', poster: 'https://picsum.photos/300/450?random=16', banner: 'https://picsum.photos/1200/600?random=16', description: 'Lets-a go!', rating: 4.4, genre: ['Animation', 'Adventure'], duration: '1h 32m', language: ['English'], cast: ['Chris Pratt'], type: MovieType.OTT, priceBuy: 15.99, priceRent: 4.99 },
  { id: '17', title: 'Avatar: Way of Water', poster: 'https://picsum.photos/300/450?random=17', banner: 'https://picsum.photos/1200/600?random=17', description: 'Return to Pandora.', rating: 4.7, genre: ['Sci-Fi', 'Adventure'], duration: '3h 12m', language: ['English'], cast: ['Sam Worthington'], type: MovieType.OTT, priceBuy: 24.99, priceRent: 6.99 },
  { id: '23', title: 'Top Gun: Maverick', poster: 'https://picsum.photos/300/450?random=23', banner: 'https://picsum.photos/1200/600?random=23', description: 'Feel the need for speed.', rating: 4.8, genre: ['Action'], duration: '2h 11m', language: ['English'], cast: ['Tom Cruise'], type: MovieType.OTT, priceBuy: 19.99, priceRent: 5.99 },
  { id: '27', title: 'The Flash', poster: 'https://picsum.photos/300/450?random=27', banner: 'https://picsum.photos/1200/600?random=27', description: 'Worlds collide.', rating: 4.2, genre: ['Action', 'Sci-Fi'], duration: '2h 24m', language: ['English'], cast: ['Ezra Miller'], type: MovieType.OTT, priceBuy: 19.99, priceRent: 5.99 },
  { id: '28', title: 'Elemental', poster: 'https://picsum.photos/300/450?random=28', banner: 'https://picsum.photos/1200/600?random=28', description: 'Opposites react.', rating: 4.6, genre: ['Animation'], duration: '1h 41m', language: ['English'], cast: ['Leah Lewis'], type: MovieType.OTT, priceBuy: 15.99, priceRent: 4.99 },

  // UPCOMING
  { id: '5', title: 'Interstellar Wars', poster: 'https://picsum.photos/300/450?random=5', banner: 'https://picsum.photos/1200/600?random=5', description: 'Space battle saga.', rating: 4.9, genre: ['Sci-Fi'], duration: '2h 30m', language: ['English'], cast: ['Mark Hamill'], type: MovieType.UPCOMING, trailerUrl: '', releaseDate: 'Oct 2025', releasePlatform: 'THEATRE' },
  { id: '7', title: 'Speed Racer', poster: 'https://picsum.photos/300/450?random=7', banner: 'https://picsum.photos/1200/600?random=7', description: 'High octane action.', rating: 4.3, genre: ['Action'], duration: '2h 00m', language: ['English'], cast: ['Vin Diesel'], type: MovieType.UPCOMING, releaseDate: 'Dec 2025', releasePlatform: 'OTT' },
  { id: '18', title: 'Dune: Part Two', poster: 'https://picsum.photos/300/450?random=18', banner: 'https://picsum.photos/1200/600?random=18', description: 'Long live the fighters.', rating: 0, genre: ['Sci-Fi', 'Adventure'], duration: 'TBA', language: ['English'], cast: ['Timothée Chalamet'], type: MovieType.UPCOMING, releaseDate: 'Nov 2025', releasePlatform: 'THEATRE' },
  { id: '19', title: 'Deadpool 3', poster: 'https://picsum.photos/300/450?random=19', banner: 'https://picsum.photos/1200/600?random=19', description: 'Wolverine returns.', rating: 0, genre: ['Action', 'Comedy'], duration: 'TBA', language: ['English'], cast: ['Ryan Reynolds'], type: MovieType.UPCOMING, releaseDate: 'Jul 2025', releasePlatform: 'THEATRE' },
  { id: '20', title: 'Joker: Folie à Deux', poster: 'https://picsum.photos/300/450?random=20', banner: 'https://picsum.photos/1200/600?random=20', description: 'Bad romance.', rating: 0, genre: ['Drama', 'Thriller'], duration: 'TBA', language: ['English'], cast: ['Joaquin Phoenix'], type: MovieType.UPCOMING, releaseDate: 'Oct 2025', releasePlatform: 'THEATRE' },
  { id: '24', title: 'The Mandalorian Movie', poster: 'https://picsum.photos/300/450?random=24', banner: 'https://picsum.photos/1200/600?random=24', description: 'This is the way.', rating: 0, genre: ['Sci-Fi'], duration: 'TBA', language: ['English'], cast: ['Pedro Pascal'], type: MovieType.UPCOMING, releaseDate: 'Jan 2026', releasePlatform: 'OTT' },
  { id: '29', title: 'Avatar 3', poster: 'https://picsum.photos/300/450?random=29', banner: 'https://picsum.photos/1200/600?random=29', description: 'The seed bearer.', rating: 0, genre: ['Sci-Fi', 'Adventure'], duration: 'TBA', language: ['English'], cast: ['Sam Worthington'], type: MovieType.UPCOMING, releaseDate: 'Dec 2026', releasePlatform: 'THEATRE' },
];

const MOCK_THEATRES: Theatre[] = [
  { id: 't1', name: 'PVR Icon', city: 'Mumbai', screens: 4, location: 'Andheri West' },
  { id: 't2', name: 'IMAX Wadala', city: 'Mumbai', screens: 1, location: 'Wadala' },
  { id: 't3', name: 'Regal Cinema', city: 'Delhi', screens: 2, location: 'Connaught Place' },
];

// --- GLOBAL STATE ---
interface AppState {
  user: User | null;
  movies: Movie[];
  theatres: Theatre[];
  tickets: Ticket[];
  notifications: Notification[];
  login: (email: string, role: UserRole, gender: string, name: string) => void;
  logout: () => void;
  addTicket: (ticket: Ticket) => void;
  buyMovie: (movieId: string) => void;
  rentMovie: (movieId: string) => void;
  toggleWatchlist: (movieId: string) => void;
  subscribe: () => void;
  addNotification: (msg: string, type: 'INFO'|'SUCCESS'|'WARNING') => void;
  markNotificationsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  updateProfile: (data: Partial<User>) => void;
  showToast: (msg: string, type: 'INFO'|'SUCCESS'|'WARNING') => void;
  addMovie: (movie: Movie) => void;
}

const AppContext = createContext<AppState>({} as AppState);

// --- HELPER COMPONENTS ---

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- SKELETON COMPONENT ---
const MovieCardSkeleton = () => (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-xl min-w-[160px] md:min-w-[200px] border border-white/5 animate-pulse">
        <div className="w-full h-[240px] md:h-[300px] bg-white/5"></div>
        <div className="p-3">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="flex justify-between items-center">
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

// --- APP COMPONENT ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, notifications, markNotificationsRead, markNotificationAsRead, movies, theatres } = useContext(AppContext);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
    setShowSuggestions(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
        setExpandedNotifId(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id);
    setExpandedNotifId(expandedNotifId === n.id ? null : n.id);
  };

  const filteredMovies = useMemo(() => {
    if (!searchTerm) return [];
    return movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, movies]);

  const filteredTheatres = useMemo(() => {
    if (!searchTerm) return [];
    return theatres.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3);
  }, [searchTerm, theatres]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white font-sans overflow-x-hidden">
      <nav className="fixed top-0 w-full z-40 bg-black/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-8 shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <button 
            onMouseEnter={() => setSidebarOpen(true)}
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="text-white hover:text-brand-red transition p-2 active:scale-95"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <Link to="/" className="flex items-center gap-2 group">
             <i className="fa-solid fa-film text-brand-red text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
             <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-300">Show<span className="text-brand-red">time</span></span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 relative hidden md:block mt-6">
            <form ref={searchRef} onSubmit={handleSearch} className="relative group w-full">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for movies, events, or theatres" 
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-full px-5 py-2.5 text-sm focus:bg-black focus:border-brand-red focus:shadow-[0_0_15px_rgba(229,9,20,0.3)] outline-none transition-all duration-300 text-white placeholder-gray-500 shadow-inner" 
                />
                <button type="submit" className="absolute right-4 top-2.5 text-gray-500 hover:text-brand-red transition hover:scale-110">
                  <i className="fa-solid fa-search"></i>
                </button>
                {showSuggestions && searchTerm.length > 0 && (filteredMovies.length > 0 || filteredTheatres.length > 0) && (
                    <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border border-white/10 rounded-xl mt-2 shadow-2xl overflow-hidden z-50 animate-scale-in origin-top">
                        {filteredMovies.length > 0 && (
                            <div className="p-2">
                                <p className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Movies</p>
                                {filteredMovies.map(m => (
                                    <div 
                                        key={m.id} 
                                        onClick={() => { navigate(`/movie/${m.id}`); setShowSuggestions(false); setSearchTerm(''); }}
                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition duration-200"
                                    >
                                        <img src={m.poster} alt={m.title} className="w-8 h-12 object-cover rounded shadow-sm group-hover:shadow-md" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate group-hover:text-brand-red transition">{m.title}</p>
                                            <p className="text-xs text-gray-400">{m.type === MovieType.NOW_SHOWING ? 'In Theatres' : 'On OTT'}</p>
                                        </div>
                                        <i className="fa-solid fa-angle-right text-gray-600 group-hover:text-white text-xs group-hover:translate-x-1 transition-transform"></i>
                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredTheatres.length > 0 && (
                             <div className="p-2 border-t border-white/5">
                                <p className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Theatres</p>
                                {filteredTheatres.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={() => { navigate(`/search?q=${t.name}`); setShowSuggestions(false); setSearchTerm(''); }}
                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition duration-200"
                                    >
                                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-brand-red transition">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate group-hover:text-brand-red transition">{t.name}</p>
                                            <p className="text-xs text-gray-400">{t.city}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                )}
            </form>
        </div>

        <div className="flex items-center gap-6">
            <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!isNotifOpen)} className="relative text-gray-300 hover:text-white transition p-1 active:scale-95">
                    <i className="fa-regular fa-bell text-xl"></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-brand-red text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-white animate-pulse border border-black">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {isNotifOpen && (
                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in-down origin-top-right">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/40 rounded-t-xl">
                            <span className="font-bold text-sm">Notifications</span>
                            <button onClick={markNotificationsRead} className="text-xs text-brand-red hover:text-white transition">Mark all read</button>
                        </div>
                        <div className="rounded-b-xl">
                            {recentNotifications.length === 0 ? <p className="p-6 text-center text-sm text-gray-500">No new notifications</p> : 
                             recentNotifications.map(n => (
                                 <div 
                                    key={n.id} 
                                    className={`relative p-4 border-b border-white/5 hover:bg-white/5 transition group ${n.read ? 'opacity-70' : 'bg-brand-red/5'}`}
                                 >
                                    <div className="cursor-pointer" onClick={() => handleNotificationClick(n)}>
                                        <div className="flex gap-3 items-start">
                                            <div className="pt-1.5 w-4 flex justify-center flex-shrink-0">
                                                {!n.read && (
                                                    <div className={`w-2 h-2 rounded-full shadow-lg ${n.type === 'SUCCESS' ? 'bg-green-500' : n.type === 'WARNING' ? 'bg-brand-gold' : 'bg-blue-500'}`}></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm leading-snug ${n.read ? 'text-gray-400' : 'text-gray-100 font-medium'}`}>{n.message}</p>
                                                <span className="text-[10px] text-gray-500 mt-1 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                     {expandedNotifId === n.id && (
                                         <div className="mt-4 relative animate-scale-in origin-top z-[100] md:absolute md:right-full md:mr-4 md:top-0 md:w-80">
                                            <div className="hidden md:block absolute top-4 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-white"></div>
                                            <div className="md:hidden absolute -top-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
                                            <div className="bg-white text-black p-4 rounded-xl shadow-2xl relative">
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                                    <i className={`fa-solid ${n.type === 'SUCCESS' ? 'fa-check-circle text-green-600' : n.type === 'WARNING' ? 'fa-triangle-exclamation text-yellow-600' : 'fa-info-circle text-blue-600'}`}></i>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{n.type} Notification</span>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <div className="mt-3 flex justify-end">
                                                    <button onClick={() => setExpandedNotifId(null)} className="text-[10px] bg-black text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition active:scale-95">Close</button>
                                                </div>
                                            </div>
                                         </div>
                                     )}
                                 </div>
                             ))}
                             {notifications.length > 5 && (
                                 <div className="p-2 text-center">
                                     <Link to="/bookings" onClick={() => setNotifOpen(false)} className="text-xs text-brand-red font-bold hover:underline">View All in Dashboard</Link>
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>

            {user ? (
                <div className="relative" ref={profileRef}>
                    <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2 hover:opacity-80 transition p-1 active:scale-95">
                         <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=E50914&color=fff`} className="w-9 h-9 rounded-full border border-white/20 object-cover" alt="Profile" />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-4 w-60 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-fade-in-down origin-top-right">
                             <div className="px-5 py-3 border-b border-white/10 mb-2 bg-black/20">
                                 <p className="font-bold text-white truncate text-base">{user.name}</p>
                                 <p className="text-xs text-gray-400 truncate mb-2">{user.email}</p>
                                 <div className="flex items-center gap-2">
                                    <span className="bg-brand-gold/20 text-brand-gold text-xs px-2 py-0.5 rounded border border-brand-gold/30 font-bold flex items-center gap-1"><i className="fa-solid fa-coins text-[10px]"></i> {user.coins}</span>
                                    {user.isSubscribed && <span className="bg-brand-red text-white text-[10px] px-2 py-0.5 rounded font-bold tracking-wider">PRO</span>}
                                 </div>
                             </div>
                             <Link to="/profile" className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition"><i className="fa-regular fa-user w-5"></i> Profile</Link>
                             <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition"><i className="fa-solid fa-sliders w-5"></i> Settings</Link>
                             <Link to="/bookings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition"><i className="fa-solid fa-ticket w-5"></i> My Bookings</Link>
                             <div className="border-t border-white/10 my-1 mx-2"></div>
                             <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-2.5 hover:bg-red-900/20 text-sm text-brand-red transition"><i className="fa-solid fa-arrow-right-from-bracket w-5"></i> Logout</button>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/login">
                    <Button variant="primary" className="text-sm px-6 py-2 shadow-brand-red/50">Sign In</Button>
                </Link>
            )}
        </div>
      </nav>

      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-black/95 backdrop-blur-xl z-50 transform transition-transform duration-300 border-r border-white/10 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} 
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center h-16 bg-black">
            <span className="font-bold text-xl tracking-tighter text-white flex items-center gap-2"><i className="fa-solid fa-bars-staggered text-brand-red"></i> MENU</span>
            <button onClick={() => setSidebarOpen(false)} className="hover:text-brand-red transition"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-4rem)] no-scrollbar">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-house w-6 text-center group-hover:text-brand-red transition"></i> Home</Link>
            <Link to="/subscription" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-crown w-6 text-center text-brand-gold group-hover:scale-110 transition"></i> Subscription</Link>
            
            {user && (
                <>
                <div className="my-2 border-t border-white/10 opacity-50 mx-2"></div>
                <p className="px-3 text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">My Account</p>
                <Link to="/bookings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-ticket-simple w-6 text-center group-hover:text-brand-red transition"></i> Bookings</Link>
                <Link to="/library" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-folder-open w-6 text-center group-hover:text-brand-red transition"></i> Library</Link>
                <Link to="/watchlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-bookmark w-6 text-center group-hover:text-brand-red transition"></i> Watchlist</Link>
                <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"><i className="fa-solid fa-gear w-6 text-center group-hover:text-brand-red transition"></i> Settings</Link>
                </>
            )}
            
            {user?.role.includes('CREATOR') && (
                 <>
                 <div className="my-2 border-t border-white/10 opacity-50 mx-2"></div>
                 <Link to="/dashboard/creator" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-brand-red/20 to-transparent border-l-4 border-brand-red text-white hover:bg-brand-red/30 transition"><i className="fa-solid fa-chart-line w-6 text-center"></i> Creator Dashboard</Link>
                 </>
            )}
            
            <div className="my-2 border-t border-white/10 opacity-50 mx-2"></div>
            <p className="px-3 text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Explore</p>
            <Link to="/creators" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition group"><i className="fa-solid fa-video w-6 text-center group-hover:text-brand-red transition"></i> For Creators</Link>
            <Link to="/support" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition group"><i className="fa-solid fa-headset w-6 text-center group-hover:text-brand-red transition"></i> Help Center</Link>
            <Link to="/about" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition group"><i className="fa-solid fa-circle-info w-6 text-center group-hover:text-brand-red transition"></i> About Us</Link>
            {user && <button onClick={logout} className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-brand-red transition mt-auto mb-4"><i className="fa-solid fa-arrow-right-from-bracket w-6 text-center"></i> Log Out</button>}
        </div>
      </div>

      <main className="flex-1 mt-16 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in mb-8 overflow-hidden">
        {children}
      </main>

      <footer className="bg-[#0a0a0a] py-16 border-t border-white/5 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
                <h3 className="text-white font-black mb-6 uppercase text-lg tracking-wider">Showtime</h3>
                <p className="mb-6 leading-relaxed">The ultimate destination for movies, tickets, and entertainment. Experience the magic of cinema and streaming in one place.</p>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition hover:scale-110"><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition hover:scale-110"><i className="fa-brands fa-twitter"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition hover:scale-110"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition hover:scale-110"><i className="fa-brands fa-youtube"></i></a>
                </div>
            </div>
            <div>
                <h3 className="text-white font-bold mb-6">Company</h3>
                <ul className="space-y-3">
                    <li><Link to="/about" className="hover:text-brand-red transition">About Us</Link></li>
                    <li><Link to="/creators" className="hover:text-brand-red transition">For Creators</Link></li>
                    <li><Link to="/career" className="hover:text-brand-red transition">Careers</Link></li>
                    <li><Link to="/contact" className="hover:text-brand-red transition">Contact</Link></li>
                </ul>
            </div>
            <div>
                <h3 className="text-white font-bold mb-6">Support</h3>
                <ul className="space-y-3">
                    <li><Link to="/support" className="hover:text-brand-red transition">Help Center</Link></li>
                    <li><Link to="/terms" className="hover:text-brand-red transition">Terms of Service</Link></li>
                    <li><Link to="/privacy" className="hover:text-brand-red transition">Privacy Policy</Link></li>
                    <li><Link to="/refunds" className="hover:text-brand-red transition">Refund Policy</Link></li>
                </ul>
            </div>
        </div>
        <div className="text-center mt-16 pt-8 border-t border-white/5">
            &copy; 2025 SHOWTIME Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// --- PAGES ---

const CreatorDashboardPage: React.FC = () => {
    const { user, movies, addMovie, showToast } = useContext(AppContext);
    const [tab, setTab] = useState<'overview' | 'manage' | 'analytics'>('overview');
    const [isUploadOpen, setUploadOpen] = useState(false);
    const [newMovie, setNewMovie] = useState<Partial<Movie>>({
        title: '',
        genre: [],
        type: MovieType.OTT,
        description: ''
    });

    if (!user || !user.role.includes('CREATOR')) return <Navigate to="/" />;

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMovie.title) {
            const movie: Movie = {
                id: Date.now().toString(),
                title: newMovie.title || 'Untitled',
                poster: `https://picsum.photos/300/450?random=${Date.now()}`,
                banner: `https://picsum.photos/1200/600?random=${Date.now()}`,
                description: newMovie.description || 'No description',
                rating: 0,
                genre: newMovie.genre || ['Drama'],
                duration: '2h 00m',
                language: ['English'],
                cast: [],
                type: newMovie.type || MovieType.OTT
            };
            addMovie(movie);
            setUploadOpen(false);
            showToast("Movie Uploaded Successfully", "SUCCESS");
        }
    };

    const myMovies = movies.filter(m => m.id); 
    const totalViews = myMovies.length * 1543; 
    const totalRevenue = myMovies.length * 520; 

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-black uppercase tracking-wide">Creator Studio</h1>
                 <Button onClick={() => setUploadOpen(true)}><i className="fa-solid fa-cloud-arrow-up"></i> Upload Movie</Button>
             </div>

             <div className="flex gap-6 border-b border-white/10 pb-1">
                 {['overview', 'manage', 'analytics'].map((t) => (
                     <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition relative ${tab === t ? 'text-brand-red' : 'text-gray-400 hover:text-white'}`}
                     >
                         {t}
                         {tab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-red shadow-[0_0_10px_#E50914]"></div>}
                     </button>
                 ))}
             </div>

             {tab === 'overview' && (
                 <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
                     <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                         <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Views</h3>
                         <p className="text-4xl font-black text-white">{totalViews.toLocaleString()}</p>
                     </div>
                     <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                         <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Revenue</h3>
                         <p className="text-4xl font-black text-brand-gold">${totalRevenue.toLocaleString()}</p>
                     </div>
                     <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                         <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Active Content</h3>
                         <p className="text-4xl font-black text-brand-red">{myMovies.length}</p>
                     </div>
                     <div className="md:col-span-3">
                         <h3 className="font-bold mb-4">Revenue Trend</h3>
                         <SimpleLineChart data={[{name: 'Jan', val: 400}, {name: 'Feb', val: 300}, {name: 'Mar', val: 600}, {name: 'Apr', val: 800}]} dataKey="val" />
                     </div>
                 </div>
             )}

             {tab === 'manage' && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
                     {myMovies.map(m => (
                         <div key={m.id} className="group relative">
                             <img src={m.poster} className="rounded-lg w-full h-[300px] object-cover opacity-80 group-hover:opacity-100 transition" />
                             <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">{m.type}</div>
                             <div className="mt-2">
                                 <h4 className="font-bold truncate">{m.title}</h4>
                                 <p className="text-xs text-gray-400">Published</p>
                             </div>
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition gap-2">
                                 <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition"><i className="fa-solid fa-pen"></i></button>
                                 <button className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition"><i className="fa-solid fa-trash"></i></button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
             
             {tab === 'analytics' && (
                 <div className="animate-slide-up">
                      <h3 className="font-bold mb-4">Audience Demographics</h3>
                      <SimpleBarChart data={[{name: '18-24', val: 30}, {name: '25-34', val: 45}, {name: '35+', val: 25}]} dataKey="val" />
                 </div>
             )}

             <Modal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} title="Upload New Content">
                 <form onSubmit={handleUpload} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-gray-400 mb-1">Title</label>
                         <input required type="text" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-400 mb-1">Description</label>
                         <textarea value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 h-24" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-400 mb-1">Type</label>
                         <select value={newMovie.type} onChange={e => setNewMovie({...newMovie, type: e.target.value as MovieType})} className="w-full bg-black/50 border border-white/10 rounded p-2">
                             <option value={MovieType.OTT}>OTT Release</option>
                             <option value={MovieType.NOW_SHOWING}>Theatrical Release</option>
                         </select>
                     </div>
                     <Button className="w-full mt-4">Publish Content</Button>
                 </form>
             </Modal>
        </div>
    );
};

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`OTP Sent to ${email} (Demo: 123456)`, "INFO");
    setStep(2);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      setStep(3);
    } else {
      showToast("Invalid OTP", "WARNING");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Password Reset Successfully. Please Login.", "SUCCESS");
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent"></div>
      <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-6">
           <p className="text-gray-400 text-sm">Enter your email address and we will send you a 6-digit code to reset your password.</p>
           <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red focus:shadow-[0_0_10px_rgba(229,9,20,0.2)] transition" />
           </div>
           <Button className="w-full py-3">Send OTP</Button>
           <div className="text-center"><Link to="/login" className="text-sm text-brand-red hover:underline">Back to Login</Link></div>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
           <p className="text-gray-400 text-sm">Enter the code sent to {email}</p>
           <input type="text" maxLength={6} placeholder="XXXXXX" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-brand-red transition" />
           <Button className="w-full py-3">Verify</Button>
           <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-white">Change Email</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
           <p className="text-gray-400 text-sm">Create a new password for your account.</p>
           <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition" />
           </div>
           <Button className="w-full py-3">Reset Password</Button>
        </form>
      )}
    </div>
  );
};

const MovieDetailsPage: React.FC = () => {
    const { id } = useParams();
    const { movies, user, buyMovie, rentMovie, showToast } = useContext(AppContext);
    const movie = movies.find(m => m.id === id);
    const navigate = useNavigate();

    if (!movie) return <div className="text-center p-20">Movie Not Found</div>;

    const isOwned = user?.library.includes(movie.id);
    const isRented = user?.rentals.some(r => r.movieId === movie.id && r.expiry > Date.now());

    return (
        <div className="animate-fade-in -mt-4 md:-mt-8">
             {/* Hero Banner */}
            <div className="relative w-full h-[60vh] md:h-[70vh]">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10"></div>
                <img src={movie.banner} alt={movie.title} className="w-full h-full object-cover animate-scale-in" />
                <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 max-w-4xl space-y-4 animate-slide-up">
                     <h1 className="text-4xl md:text-6xl font-black drop-shadow-xl">{movie.title}</h1>
                     <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                        <span className="flex items-center gap-1 text-brand-gold font-bold"><i className="fa-solid fa-star"></i> {movie.rating}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                        <span>•</span>
                        <span>{movie.genre.join(', ')}</span>
                        <span>•</span>
                        <span>{movie.language.join(', ')}</span>
                     </div>
                     <p className="text-lg md:text-xl text-gray-300 max-w-2xl line-clamp-3 leading-relaxed">{movie.description}</p>
                     
                     <div className="flex flex-wrap gap-4 pt-4">
                        {movie.type === MovieType.NOW_SHOWING ? (
                             <Button onClick={() => navigate(`/book/${movie.id}`)} className="px-8 py-3 text-lg rounded-full"><i className="fa-solid fa-ticket"></i> Book Tickets</Button>
                        ) : (
                            <>
                                {(isOwned || isRented) ? (
                                    <Button className="px-8 py-3 text-lg rounded-full"><i className="fa-solid fa-play"></i> Watch Now</Button>
                                ) : (
                                    <>
                                        {movie.priceBuy && <Button onClick={() => { buyMovie(movie.id); }} className="px-8 py-3 text-lg rounded-full"><i className="fa-solid fa-cart-shopping"></i> Buy ${movie.priceBuy}</Button>}
                                        {movie.priceRent && <Button variant="secondary" onClick={() => { rentMovie(movie.id); }} className="px-8 py-3 text-lg rounded-full border border-white/20"><i className="fa-solid fa-clock"></i> Rent ${movie.priceRent}</Button>}
                                    </>
                                )}
                            </>
                        )}
                        {movie.trailerUrl && <Button variant="outline" onClick={() => window.open(movie.trailerUrl, '_blank')} className="px-8 py-3 text-lg rounded-full border-white/30 hover:bg-white/10"><i className="fa-brands fa-youtube"></i> Trailer</Button>}
                     </div>
                </div>
            </div>

            <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
                     <section>
                         <h3 className="text-2xl font-bold mb-4 border-l-4 border-brand-red pl-3">Synopsis</h3>
                         <p className="text-gray-300 leading-relaxed text-lg">{movie.description}</p>
                     </section>
                     <section>
                         <h3 className="text-2xl font-bold mb-4 border-l-4 border-brand-red pl-3">Cast & Crew</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {movie.cast.map(actor => (
                                 <div key={actor} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition">
                                     <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">{actor[0]}</div>
                                     <span className="font-medium text-sm">{actor}</span>
                                 </div>
                             ))}
                         </div>
                     </section>
                </div>
                <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 shadow-xl">
                        <h3 className="font-bold text-lg mb-4">Movie Info</h3>
                         <ul className="space-y-4 text-sm text-gray-400">
                             <li className="flex justify-between border-b border-white/5 pb-2"><span>Release Date</span> <span className="text-white font-medium">{movie.releaseDate || 'Now Showing'}</span></li>
                             <li className="flex justify-between border-b border-white/5 pb-2"><span>Director</span> <span className="text-white font-medium">Unknown</span></li>
                             <li className="flex justify-between"><span>Music</span> <span className="text-white font-medium">Unknown</span></li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingPage: React.FC = () => {
    const { id } = useParams();
    const { movies, theatres, addTicket, user, showToast } = useContext(AppContext);
    const movie = movies.find(m => m.id === id);
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);
    const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [step, setStep] = useState(1); // 1: Theatre/Time, 2: Seats, 3: Payment

    if (!movie) return <div>Movie not found</div>;

    const availableTheatres = theatres.filter(t => movie.theatreIds?.includes(t.id));
    const dates = ['Today', 'Tomorrow', 'Wed, 14 Jun', 'Thu, 15 Jun'];
    const times = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'];
    
    // Mock Seat Grid (8x10)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const toggleSeat = (seat: string) => {
        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat));
        } else {
            if (selectedSeats.length >= 6) {
                showToast("You can only select up to 6 seats", "WARNING");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleBooking = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const ticket: Ticket = {
            id: Date.now().toString(),
            userId: user.id,
            showTimeId: selectedShowTime || 'st1',
            movieTitle: movie.title,
            theatreName: theatres.find(t => t.id === selectedTheatre)?.name || 'Unknown Theatre',
            seats: selectedSeats,
            totalAmount: selectedSeats.length * 250, // Mock price
            qrCode: `${movie.title}-${selectedSeats.join(',')}`,
            date: selectedDate,
            time: selectedShowTime || '10:00 AM',
            status: 'ACTIVE'
        };
        addTicket(ticket);
        navigate('/bookings');
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-400 mb-8">{movie.genre.join(', ')} • {movie.duration}</p>

            {/* Step Progress */}
            <div className="flex items-center mb-8 text-sm font-bold text-gray-500 bg-white/5 p-3 rounded-lg">
                <span className={`${step >= 1 ? 'text-brand-red' : ''} transition-colors duration-300`}>1. Showtimes</span>
                <span className="mx-2 text-gray-600">/</span>
                <span className={`${step >= 2 ? 'text-brand-red' : ''} transition-colors duration-300`}>2. Seats</span>
                <span className="mx-2 text-gray-600">/</span>
                <span className={`${step >= 3 ? 'text-brand-red' : ''} transition-colors duration-300`}>3. Payment</span>
            </div>

            {step === 1 && (
                <div className="space-y-8 animate-slide-up">
                     {/* Date Selector */}
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {dates.map(date => (
                            <button 
                                key={date} 
                                onClick={() => setSelectedDate(date)}
                                className={`px-6 py-3 rounded-xl min-w-[100px] border transition-all duration-300 ${selectedDate === date ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20 scale-105' : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
                            >
                                <span className="block text-xs uppercase tracking-wider mb-1 opacity-70">Date</span>
                                <span className="font-bold">{date}</span>
                            </button>
                        ))}
                    </div>

                    {/* Theatres List */}
                    <div className="space-y-4">
                        {availableTheatres.map(t => (
                            <div key={t.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2"><i className="fa-regular fa-heart text-gray-500 hover:text-brand-red cursor-pointer transition"></i> {t.name}</h3>
                                        <p className="text-xs text-green-400 mt-1"><i className="fa-solid fa-mobile-screen"></i> M-Ticket Available</p>
                                    </div>
                                    <span className="text-gray-500 text-sm"><i className="fa-solid fa-location-dot"></i> {t.location}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {times.map(time => (
                                        <button 
                                            key={time} 
                                            onClick={() => { setSelectedTheatre(t.id); setSelectedShowTime(time); setStep(2); }}
                                            className="px-5 py-2 rounded border border-white/20 hover:bg-green-900/30 hover:border-green-500 hover:text-green-400 text-sm transition font-medium"
                                        >
                                            {time}
                                            <span className="block text-[10px] text-gray-500 mt-0.5 font-normal">4K Dolby</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 text-center relative overflow-hidden shadow-2xl">
                        <div className="w-2/3 mx-auto h-16 bg-gradient-to-b from-white/10 to-transparent rounded-t-full mb-8 transform perspective-1000 rotate-x-12"></div>
                        <p className="text-xs text-gray-500 mb-10 uppercase tracking-widest">All Eyes This Way</p>
                        
                        <div className="inline-grid gap-y-3 gap-x-2">
                             {rows.map(row => (
                                 <div key={row} className="flex gap-3 items-center">
                                     <span className="w-6 text-gray-500 text-xs font-bold">{row}</span>
                                     {cols.map(col => {
                                         const seatId = `${row}${col}`;
                                         const isSelected = selectedSeats.includes(seatId);
                                         const isSold = Math.random() > 0.9; // Randomly sell some seats
                                         return (
                                             <button 
                                                key={seatId}
                                                disabled={isSold}
                                                onClick={() => toggleSeat(seatId)}
                                                className={`w-8 h-8 rounded-t-lg text-[10px] font-bold transition-all duration-200 ${
                                                    isSold ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50' : 
                                                    isSelected ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)] scale-110 transform -translate-y-1' : 
                                                    'bg-white/10 hover:bg-white/30 text-gray-300 hover:scale-105'
                                                }`}
                                             >
                                                 {col}
                                             </button>
                                         )
                                     })}
                                 </div>
                             ))}
                        </div>

                        <div className="flex justify-center gap-6 mt-10 text-xs text-gray-400">
                             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white/10 rounded"></div> Available</div>
                             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded opacity-50"></div> Sold</div>
                             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div> Selected</div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md sticky bottom-4 z-30 shadow-2xl">
                        <div>
                            <p className="text-gray-400 text-sm">Selected Seats</p>
                            <p className="font-bold text-xl text-brand-gold animate-pulse">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                        </div>
                        <Button disabled={selectedSeats.length === 0} onClick={() => setStep(3)}>Proceed to Pay ${(selectedSeats.length * 12.5).toFixed(2)}</Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-md mx-auto animate-fade-in bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-brand-gold"></div>
                    <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Booking Summary</h3>
                    <div className="space-y-4 mb-6 text-sm">
                        <div className="flex justify-between text-gray-300"><span>Movie</span> <span className="font-bold text-white">{movie.title}</span></div>
                        <div className="flex justify-between text-gray-300"><span>Theatre</span> <span className="font-bold text-white">{theatres.find(t => t.id === selectedTheatre)?.name}</span></div>
                        <div className="flex justify-between text-gray-300"><span>Date & Time</span> <span className="font-bold text-white">{selectedDate}, {selectedShowTime}</span></div>
                        <div className="flex justify-between text-gray-300"><span>Seats</span> <span className="font-bold text-white">{selectedSeats.join(', ')}</span></div>
                        <div className="border-t border-white/10 my-2"></div>
                        <div className="flex justify-between text-lg font-bold"><span>Total</span> <span className="text-brand-gold text-2xl">${(selectedSeats.length * 12.5).toFixed(2)}</span></div>
                    </div>
                    
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">Payment Method</h4>
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 p-3 border border-brand-red/50 bg-brand-red/10 rounded-lg cursor-pointer hover:bg-brand-red/20 transition">
                             <i className="fa-brands fa-cc-visa text-2xl"></i>
                             <div className="flex-1">
                                 <p className="font-bold text-sm">Visa ending in 4242</p>
                                 <p className="text-xs text-gray-400">Expires 12/25</p>
                             </div>
                             <i className="fa-solid fa-check-circle text-brand-red"></i>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-white/10 rounded-lg opacity-50 cursor-not-allowed">
                             <i className="fa-brands fa-google-pay text-2xl"></i>
                             <p className="font-bold text-sm">Google Pay</p>
                        </div>
                    </div>

                    <Button onClick={handleBooking} className="w-full py-3 shadow-lg shadow-brand-red/20 text-lg">Pay & Book Ticket</Button>
                </div>
            )}
        </div>
    );
};

const BookingsPage: React.FC = () => {
    const { user, tickets } = useContext(AppContext);
    const myTickets = tickets.filter(t => t.userId === user?.id);

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold">My Bookings</h1>
                 <div className="bg-[#1a1a1a] rounded-full p-1 flex text-xs font-bold border border-white/10">
                     <button className="bg-white/10 px-4 py-2 rounded-full text-white shadow-sm">Active</button>
                     <button className="px-4 py-2 rounded-full text-gray-500 hover:text-white transition">History</button>
                 </div>
             </div>
             
             {myTickets.length > 0 ? (
                 <div className="grid md:grid-cols-2 gap-6">
                     {myTickets.map(ticket => (
                         <TicketCard key={ticket.id} ticket={ticket} />
                     ))}
                 </div>
             ) : (
                 <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-white/5 flex flex-col items-center">
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-ticket text-4xl text-gray-600"></i>
                     </div>
                     <p className="text-gray-300 text-lg font-bold mb-2">No active bookings found</p>
                     <p className="text-gray-500 text-sm mb-6">It looks like you haven't booked any movies yet.</p>
                     <Link to="/"><Button variant="outline">Browse Movies</Button></Link>
                 </div>
             )}
        </div>
    );
};

const SubscriptionPage: React.FC = () => {
    const { user, subscribe } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSubscribe = () => {
        if (!user) navigate('/login');
        else subscribe();
    };

    return (
        <div className="py-10 animate-fade-in">
             <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
                 <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">Unlock the Ultimate Experience</h1>
                 <p className="text-gray-400 text-lg">Watch movies in 4K, get exclusive discounts on tickets, and enjoy ad-free streaming.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                 {/* Basic */}
                 <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative hover:scale-105 transition-transform duration-300 shadow-xl">
                     <h3 className="text-xl font-bold mb-2">Showtime Basic</h3>
                     <div className="text-3xl font-black mb-6">$9.99<span className="text-sm font-normal text-gray-400">/mo</span></div>
                     <ul className="space-y-4 mb-8 text-sm text-gray-300">
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> Unlimited Streaming</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> HD Quality (720p)</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> Mobile & Laptop</li>
                     </ul>
                     <Button variant="outline" className="w-full">Choose Basic</Button>
                 </div>

                 {/* Pro (Recommended) */}
                 <div className="bg-gradient-to-b from-brand-red/10 to-[#1a1a1a] p-8 rounded-3xl border border-brand-red relative transform scale-110 shadow-2xl shadow-brand-red/20 z-10">
                     <div className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-lg">Most Popular</div>
                     <h3 className="text-xl font-bold mb-2 text-white">Showtime Pro</h3>
                     <div className="text-4xl font-black mb-6 text-brand-gold text-shadow">$14.99<span className="text-sm font-normal text-gray-400 text-white">/mo</span></div>
                     <ul className="space-y-4 mb-8 text-sm text-gray-200 font-medium">
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-gold"></i> Everything in Basic</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-gold"></i> 4K Ultra HD + Dolby Atmos</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-gold"></i> 2 Free Theatre Tickets/mo</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-gold"></i> Early Access to New Releases</li>
                     </ul>
                     <Button variant="gold" onClick={handleSubscribe} className="w-full font-bold py-3 text-lg shadow-lg shadow-yellow-600/20">Upgrade to Pro</Button>
                 </div>

                 {/* Family */}
                 <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative hover:scale-105 transition-transform duration-300 shadow-xl">
                     <h3 className="text-xl font-bold mb-2">Showtime Family</h3>
                     <div className="text-3xl font-black mb-6">$24.99<span className="text-sm font-normal text-gray-400">/mo</span></div>
                     <ul className="space-y-4 mb-8 text-sm text-gray-300">
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> Everything in Pro</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> 4 Simultaneous Screens</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-brand-red"></i> Parental Controls</li>
                     </ul>
                     <Button variant="outline" className="w-full">Choose Family</Button>
                 </div>
             </div>
        </div>
    );
};

const CreatorsInfoPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
             <div className="relative h-[50vh] rounded-3xl overflow-hidden mb-16 shadow-2xl">
                 <img src="https://picsum.photos/1200/600?grayscale" className="w-full h-full object-cover animate-scale-in" alt="Cinema" />
                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-center p-6 backdrop-blur-[2px]">
                     <div className="max-w-3xl animate-slide-up">
                         <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">Create. Showcase. <span className="text-brand-red">Earn.</span></h1>
                         <p className="text-xl text-gray-300 mb-8">Join the largest network of theatres and production houses. Reach millions of viewers instantly.</p>
                         <div className="flex justify-center gap-4">
                             <Link to="/register?role=production"><Button className="px-8 py-4 text-lg">Join as Production House</Button></Link>
                             <Link to="/register?role=theatre"><Button variant="outline" className="px-8 py-4 text-lg">Join as Theatre Partner</Button></Link>
                         </div>
                     </div>
                 </div>
             </div>

             <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                 <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                     <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 text-3xl mb-6 group-hover:scale-110 transition-transform"><i className="fa-solid fa-film"></i></div>
                     <h3 className="text-2xl font-bold mb-4">For Production Houses</h3>
                     <ul className="space-y-3 text-gray-400">
                         <li className="flex gap-3"><i className="fa-solid fa-check text-blue-500"></i> Direct-to-OTT Release Platform</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-blue-500"></i> Real-time Analytics & Revenue Tracking</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-blue-500"></i> Global Audience Reach</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-blue-500"></i> Set Your Own Pricing (Buy/Rent)</li>
                     </ul>
                 </div>
                 <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors group">
                     <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 text-3xl mb-6 group-hover:scale-110 transition-transform"><i className="fa-solid fa-chair"></i></div>
                     <h3 className="text-2xl font-bold mb-4">For Theatre Partners</h3>
                     <ul className="space-y-3 text-gray-400">
                         <li className="flex gap-3"><i className="fa-solid fa-check text-green-500"></i> Simplified Ticket Management</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-green-500"></i> Dynamic Pricing Tools</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-green-500"></i> Automated Show Scheduling</li>
                         <li className="flex gap-3"><i className="fa-solid fa-check text-green-500"></i> M-Ticket Integration</li>
                     </ul>
                 </div>
             </div>
        </div>
    );
};

const AboutPage: React.FC = () => {
    const team = [
        { name: 'Jason Kenneth N', role: 'Full Stack', link: 'https://jasonkennethn.com' },
        { name: 'Sarah Connor', role: 'Frontend Lead' },
        { name: 'Mike Ross', role: 'Backend Lead' },
        { name: 'Jessica Pearson', role: 'UI/UX Designer' },
        { name: 'Harvey Specter', role: 'Product Manager' },
        { name: 'Louis Litt', role: 'QA Engineer' }
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-16 py-10">
            <section className="text-center space-y-6 animate-slide-up">
                <h1 className="text-4xl font-black">Reimagining Entertainment</h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                    Showtime is a premier entertainment platform that bridges the gap between traditional cinema and modern streaming. 
                    Founded in 2025, our mission is to provide a seamless ecosystem where users can discover, book, and watch content 
                    effortlessly, while empowering creators with state-of-the-art tools.
                </p>
            </section>

            <section className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                <h2 className="text-2xl font-bold mb-8 text-center">Meet Our Team</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {team.map((member, i) => {
                        const content = (
                            <div className={`text-center group bg-[#1a1a1a] p-6 rounded-xl border border-white/5 hover:border-brand-red/50 transition duration-300 h-full flex flex-col justify-center items-center ${member.link ? 'cursor-pointer hover:bg-white/5' : ''}`}>
                                <h3 className="font-bold text-lg text-white group-hover:text-brand-red transition">{member.name}</h3>
                                <p className="text-sm text-gray-500 mt-2 font-mono uppercase tracking-wider">{member.role}</p>
                            </div>
                        );

                        if (member.link) {
                            return (
                                <a key={i} href={member.link} target="_blank" rel="noopener noreferrer" className="block h-full hover:scale-105 transition-transform duration-300">
                                    {content}
                                </a>
                            );
                        }
                        
                        return <div key={i} className="block h-full">{content}</div>;
                    })}
                </div>
            </section>
        </div>
    );
};

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { movies, theatres, toggleWatchlist, user } = useContext(AppContext);
    const navigate = useNavigate();

    const movieResults = movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.genre.some(g => g.toLowerCase().includes(query.toLowerCase())));
    const theatreResults = theatres.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.location.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Search Results for "{query}"</h1>
            
            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-300 border-l-4 border-brand-red pl-3">Movies</h2>
                {movieResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movieResults.map(m => (
                            <MovieCard 
                                key={m.id} 
                                movie={m} 
                                onClick={() => navigate(`/movie/${m.id}`)}
                                onToggleWatchlist={(e) => { e.stopPropagation(); toggleWatchlist(m.id); }}
                                isInWatchlist={user?.watchlist.includes(m.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic p-4 bg-white/5 rounded-lg">No movies found matching your search.</p>
                )}
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-300 border-l-4 border-brand-red pl-3">Theatres</h2>
                {theatreResults.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {theatreResults.map(t => (
                            <div key={t.id} className="bg-black/40 p-6 rounded-xl border border-white/10 hover:border-white/30 transition shadow-lg">
                                <h3 className="font-bold text-lg mb-1">{t.name}</h3>
                                <p className="text-gray-400 text-sm mb-4"><i className="fa-solid fa-location-dot mr-2 text-brand-red"></i>{t.location}, {t.city}</p>
                                <Button onClick={() => navigate('/')} variant="outline" className="w-full text-sm">View Shows</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-gray-500 italic p-4 bg-white/5 rounded-lg">No theatres found matching your search.</p>
                )}
            </section>
        </div>
    );
};

const SupportPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{sender: 'user'|'bot', text: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim()) return;
        
        const newHistory = [...chatHistory, {sender: 'user' as const, text: query}];
        setChatHistory(newHistory);
        setQuery('');
        
        // Scroll to bottom
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        const response = await getChatbotResponse(query);
        setChatHistory([...newHistory, {sender: 'bot', text: response}]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in grid md:grid-cols-2 gap-12">
             <div className="space-y-8 animate-slide-up">
                 <div>
                     <h1 className="text-3xl font-bold mb-4">How can we help?</h1>
                     <p className="text-gray-400">Browse FAQs or chat with our AI assistant for instant support.</p>
                 </div>
                 
                 <div className="space-y-4">
                     {['How do I cancel a ticket?', 'Refund policy details', 'Subscription benefits', 'Contact customer care'].map((faq, i) => (
                         <div key={i} className="bg-[#1a1a1a] p-4 rounded-lg border border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition hover:translate-x-1">
                             <span>{faq}</span>
                             <i className="fa-solid fa-chevron-right text-xs text-gray-500"></i>
                         </div>
                     ))}
                 </div>

                 <div className="bg-brand-red/10 p-6 rounded-xl border border-brand-red/20">
                     <h3 className="font-bold mb-2 text-brand-red"><i className="fa-solid fa-envelope mr-2"></i> Email Support</h3>
                     <p className="text-sm text-gray-300">support@showtime.com</p>
                     <p className="text-sm text-gray-300 mt-1">Response time: 24 hours</p>
                 </div>
             </div>

             {/* Live Chat */}
             <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 flex flex-col h-[500px] shadow-2xl animate-scale-in">
                 <div className="p-4 border-b border-white/10 bg-black/40 rounded-t-2xl flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="font-bold">Live Chat Assistant</span>
                 </div>
                 <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                     <div className="flex justify-start">
                         <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm leading-relaxed">
                             Hello! I'm your Showtime assistant. How can I assist you today?
                         </div>
                     </div>
                     {chatHistory.map((msg, i) => (
                         <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                             <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-brand-red text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                                 {msg.text}
                             </div>
                         </div>
                     ))}
                     <div ref={chatEndRef} />
                 </div>
                 <form onSubmit={handleChat} className="p-4 border-t border-white/10 flex gap-2">
                     <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type your message..." 
                        className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-brand-red transition"
                     />
                     <button type="submit" className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center hover:bg-red-700 transition active:scale-95 shadow-lg">
                         <i className="fa-solid fa-paper-plane"></i>
                     </button>
                 </form>
             </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { user } = useContext(AppContext);
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-xl">
                 <div className="w-32 h-32 rounded-full border-4 border-brand-red overflow-hidden shadow-2xl relative">
                     <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=000&color=fff`} className="w-full h-full object-cover" alt="Profile" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                     <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                     <p className="text-gray-400 mb-4">{user.email}</p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <span className="bg-brand-gold/10 text-brand-gold px-4 py-1.5 rounded-full border border-brand-gold/20 font-bold flex items-center gap-2"><i className="fa-solid fa-coins"></i> {user.coins} Coins</span>
                         {user.isSubscribed ? 
                            <span className="bg-brand-red text-white px-4 py-1.5 rounded-full font-bold shadow-lg shadow-brand-red/20"><i className="fa-solid fa-crown mr-2"></i> Premium Member</span> :
                            <Link to="/subscription"><span className="bg-gray-700 text-gray-300 px-4 py-1.5 rounded-full font-bold hover:bg-gray-600 cursor-pointer transition">Free Member (Upgrade)</span></Link>
                         }
                     </div>
                 </div>
                 <Link to="/settings"><Button variant="outline"><i className="fa-solid fa-pen mr-2"></i> Edit Profile</Button></Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-clock-rotate-left text-brand-red"></i> Watch History</h3>
                    <p className="text-gray-500 text-sm italic p-4 bg-black/20 rounded">No movies watched recently.</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-pie text-brand-red"></i> Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-xl text-center">
                            <span className="block text-3xl font-black text-white">{user.library.length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Owned</span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl text-center">
                            <span className="block text-3xl font-black text-white">{user.watchlist.length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Watchlist</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { user, logout } = useContext(AppContext);
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            
            <div className="space-y-6 animate-slide-up">
                 <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/5 transition">
                     <div>
                         <p className="font-bold">Notifications</p>
                         <p className="text-xs text-gray-400">Receive updates about new releases and offers.</p>
                     </div>
                     <div className="w-12 h-6 bg-brand-red rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                 </div>
                 
                 <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5">
                     <p className="font-bold mb-4">Personal Information</p>
                     <div className="space-y-4">
                         <input type="text" value={user.name} disabled className="w-full bg-black/50 border border-white/10 rounded p-3 text-gray-400 cursor-not-allowed" />
                         <input type="email" value={user.email} disabled className="w-full bg-black/50 border border-white/10 rounded p-3 text-gray-400 cursor-not-allowed" />
                     </div>
                 </div>

                 <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 border-l-4 border-l-red-900">
                     <p className="font-bold mb-4 text-red-500">Danger Zone</p>
                     <Button variant="danger" onClick={logout} className="w-full">Delete Account</Button>
                 </div>
            </div>
        </div>
    );
};

const WatchlistPage: React.FC = () => {
    const { user, movies, toggleWatchlist } = useContext(AppContext);
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" />;
    
    const watchlistMovies = movies.filter(m => user.watchlist.includes(m.id));

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold flex items-center gap-3"><i className="fa-solid fa-bookmark text-brand-red"></i> Your Watchlist</h1>
            {watchlistMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchlistMovies.map(m => (
                        <MovieCard 
                            key={m.id} 
                            movie={m} 
                            onClick={() => navigate(`/movie/${m.id}`)}
                            onToggleWatchlist={(e) => { e.stopPropagation(); toggleWatchlist(m.id); }}
                            isInWatchlist={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <i className="fa-regular fa-bookmark text-6xl mb-4 opacity-50"></i>
                    <p className="text-lg">Your watchlist is empty.</p>
                    <Link to="/" className="text-brand-red hover:underline mt-2">Discover movies to add</Link>
                </div>
            )}
        </div>
    );
};

const LibraryPage: React.FC = () => {
     const { user, movies } = useContext(AppContext);
     const navigate = useNavigate();
     if (!user) return <Navigate to="/login" />;

     const myMovies = movies.filter(m => user.library.includes(m.id));

     return (
         <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-bold flex items-center gap-3"><i className="fa-solid fa-folder-open text-brand-gold"></i> Your Library</h1>
             {myMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {myMovies.map(m => (
                        <div key={m.id} onClick={() => navigate(`/movie/${m.id}`)} className="group cursor-pointer bg-[#1a1a1a] rounded-lg p-2 hover:bg-white/5 transition">
                            <div className="relative rounded-lg overflow-hidden mb-2">
                                <img src={m.poster} alt={m.title} className="w-full h-[300px] object-cover transition duration-300 group-hover:scale-105 group-hover:blur-sm" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <i className="fa-solid fa-play-circle text-6xl text-white drop-shadow-lg"></i>
                                </div>
                            </div>
                            <h3 className="font-bold truncate px-1">{m.title}</h3>
                            <p className="text-xs text-brand-gold px-1 font-bold uppercase tracking-wide">Purchased</p>
                        </div>
                    ))}
                </div>
             ) : (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <i className="fa-solid fa-film text-6xl mb-4 opacity-50"></i>
                    <p className="text-lg">You haven't bought any movies yet.</p>
                </div>
             )}
         </div>
     );
};

const HomePage: React.FC = () => {
    const { movies, user } = useContext(AppContext);
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [loadingContent, setLoadingContent] = useState(true);
    const navigate = useNavigate();

    const nowShowing = useMemo(() => movies.filter(m => m.type === MovieType.NOW_SHOWING), [movies]);
    const ottMovies = useMemo(() => movies.filter(m => m.type === MovieType.OTT), [movies]);
    const upcoming = useMemo(() => movies.filter(m => m.type === MovieType.UPCOMING), [movies]);
    const trendingMovies = useMemo(() => movies.slice(0, 5), [movies]);

    // Simulate content loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingContent(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchRecs = async () => {
            if (user && user.library.length > 0) {
                setLoadingRecs(true);
                const userMovies = movies.filter(m => user.library.includes(m.id));
                const available = movies.filter(m => !user.library.includes(m.id));
                try {
                    const jsonStr = await getAIRecommendations(userMovies, available);
                    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                    const titles: string[] = JSON.parse(cleanJson);
                    if(Array.isArray(titles)) {
                         const recMovies = movies.filter(m => titles.includes(m.title));
                         setRecommendations(recMovies);
                    }
                } catch (e) {
                    console.error("Failed to get recommendations", e);
                }
                setLoadingRecs(false);
            }
        };
        fetchRecs();
    }, [user, movies]);

    return (
        <div className="space-y-12 animate-fade-in">
             {/* Hero Carousel - Now Scrollable */}
             <section className="relative">
                <HorizontalScrollContainer>
                    {trendingMovies.map((movie, index) => (
                        <div 
                           key={movie.id}
                           className="relative h-[50vh] md:h-[60vh] min-w-[85vw] md:min-w-[75vw] rounded-3xl overflow-hidden shadow-2xl snap-center cursor-pointer group border border-white/5 mx-2"
                           onClick={() => navigate(`/movie/${movie.id}`)}
                        >
                             <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10"></div>
                             <img 
                                src={movie.banner} 
                                alt={movie.title} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                             />
                             <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 max-w-2xl animate-slide-up">
                                 <span className="bg-brand-red text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-lg shadow-brand-red/40 animate-pulse-slow">Trending #{index + 1}</span>
                                 <h1 className="text-3xl md:text-6xl font-black mb-4 drop-shadow-2xl text-white leading-tight">{movie.title}</h1>
                                 <p className="text-gray-300 mb-6 line-clamp-2 drop-shadow-md text-sm md:text-lg font-medium">{movie.description}</p>
                                 <div className="flex gap-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                     <Button className="rounded-full px-8 py-3 text-lg shadow-brand-red/40 hover:scale-105 transition-transform"><i className="fa-solid fa-play"></i> Watch Now</Button>
                                     <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition backdrop-blur-sm hover:scale-110"><i className="fa-solid fa-plus"></i></button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </HorizontalScrollContainer>
            </section>

            {user && (recommendations.length > 0 || loadingRecs) && (
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><i className="fa-solid fa-wand-magic-sparkles text-brand-gold"></i> Recommended For You</h2>
                    {loadingRecs ? (
                        <HorizontalScrollContainer>
                             {[1,2,3,4,5].map(i => <MovieCardSkeleton key={i} />)}
                        </HorizontalScrollContainer>
                    ) : (
                        <HorizontalScrollContainer>
                            {recommendations.map(m => (
                                 <MovieCard key={m.id} movie={m} onClick={() => navigate(`/movie/${m.id}`)} />
                            ))}
                        </HorizontalScrollContainer>
                    )}
                </section>
            )}

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-red pl-3">Now In Theatres</h2>
                    <Link to="/search?type=theatre" className="text-sm text-brand-red font-bold hover:underline">View All</Link>
                </div>
                <HorizontalScrollContainer>
                    {loadingContent 
                        ? [1,2,3,4,5].map(i => <MovieCardSkeleton key={i} />)
                        : nowShowing.map(m => (
                            <MovieCard key={m.id} movie={m} onClick={() => navigate(`/movie/${m.id}`)} badge="Cinema" badgeColor="bg-brand-red" />
                        ))
                    }
                </HorizontalScrollContainer>
            </section>

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-3">Showtime Originals</h2>
                    <Link to="/search?type=ott" className="text-sm text-blue-500 font-bold hover:underline">View All</Link>
                </div>
                <HorizontalScrollContainer>
                    {loadingContent
                        ? [1,2,3,4,5].map(i => <MovieCardSkeleton key={i} />)
                        : ottMovies.map(m => (
                            <MovieCard key={m.id} movie={m} onClick={() => navigate(`/movie/${m.id}`)} badge="Exclusive" badgeColor="bg-blue-600" />
                        ))
                    }
                </HorizontalScrollContainer>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-gray-500 pl-3">Coming Soon</h2>
                <HorizontalScrollContainer>
                    {loadingContent
                        ? [1,2,3,4,5].map(i => <MovieCardSkeleton key={i} />)
                        : upcoming.map(m => (
                            <MovieCard 
                                key={m.id}
                                movie={m}
                                onClick={() => navigate(`/movie/${m.id}`)}
                                badge={m.releaseDate} // Shows date as badge
                                badgeColor="bg-gray-700"
                            />
                        ))
                    }
                </HorizontalScrollContainer>
            </section>
        </div>
    );
};

const AuthPage: React.FC = () => {
    const { login } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const isRegister = location.pathname === '/register';
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Male');
    const [role, setRole] = useState<UserRole>(UserRole.USER);

    useEffect(() => {
        const r = searchParams.get('role');
        if (r === 'production') setRole(UserRole.CREATOR_PRODUCTION);
        if (r === 'theatre') setRole(UserRole.CREATOR_THEATRE);
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        if (isRegister && !name) return;
        login(email, role, gender, isRegister ? name : 'User');
        navigate('/');
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
            <h2 className="text-3xl font-black mb-2 text-center">{isRegister ? 'Join Showtime' : 'Welcome Back'}</h2>
            <p className="text-center text-gray-400 mb-8 text-sm">{isRegister ? 'Create an account to start your journey' : 'Login to access your personalized library'}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {isRegister && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition text-white" placeholder="John Doe" />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition text-white" placeholder="you@example.com" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition text-white" placeholder="••••••••" />
                </div>
                {isRegister && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gender</label>
                            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition text-white appearance-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Account Type</label>
                            <select disabled value={role} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-brand-red transition text-white appearance-none opacity-50 cursor-not-allowed">
                                <option value={UserRole.USER}>Viewer</option>
                                <option value={UserRole.CREATOR_PRODUCTION}>Production House</option>
                                <option value={UserRole.CREATOR_THEATRE}>Theatre Partner</option>
                            </select>
                        </div>
                    </div>
                )}
                {!isRegister && (
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-xs text-brand-red hover:underline">Forgot Password?</Link>
                    </div>
                )}
                <Button type="submit" className="w-full py-3 mt-4 text-lg shadow-lg shadow-brand-red/20 hover:scale-105">{isRegister ? 'Create Account' : 'Sign In'}</Button>
            </form>
            <div className="mt-8 text-center pt-6 border-t border-white/5">
                <p className="text-gray-400 text-sm">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"} <Link to={isRegister ? '/login' : '/register'} className="text-brand-red font-bold hover:underline ml-1">{isRegister ? 'Log In' : 'Sign Up'}</Link>
                </p>
            </div>
        </div>
    );
};

// Main App Wrapper
const App: React.FC = () => {
    // Basic state setup (simplified for response size)
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toast, setToast] = useState<{msg: string, type: 'INFO'|'SUCCESS'|'WARNING'} | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>(() => {
         const saved = localStorage.getItem('tickets');
         return saved ? JSON.parse(saved) : [];
    });
    const [movies, setMovies] = useState<Movie[]>(() => {
        const saved = localStorage.getItem('movies');
        return saved ? JSON.parse(saved) : MOCK_MOVIES;
    });

    // Mock Methods
    const login = (email: string, role: UserRole, gender: string, name: string) => {
        const newUser: User = { id: 'u1', name, email, role, coins: 0, isSubscribed: false, library: [], rentals: [], watchlist: [], gender: gender as any };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        showToast(`Welcome back, ${name}!`, "SUCCESS");
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        showToast("Logged out successfully", "INFO");
    };
    const showToast = (msg: string, type: any) => setToast({ msg, type });
    const toggleWatchlist = (movieId: string) => {
        if(!user) { showToast("Please login first", "WARNING"); return; }
        const newWatchlist = user.watchlist.includes(movieId) 
            ? user.watchlist.filter(id => id !== movieId)
            : [...user.watchlist, movieId];
        const updated = { ...user, watchlist: newWatchlist };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        showToast(user.watchlist.includes(movieId) ? "Removed from Watchlist" : "Added to Watchlist", "INFO");
    };
    const subscribe = () => {
        if(!user) return;
        const updated = { ...user, isSubscribed: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        showToast("Welcome to Showtime Premium!", "SUCCESS");
    };
    const addTicket = (ticket: Ticket) => {
        const newTickets = [...tickets, ticket];
        setTickets(newTickets);
        localStorage.setItem('tickets', JSON.stringify(newTickets));
        showToast("Ticket Booked Successfully!", "SUCCESS");
    };
    const buyMovie = (movieId: string) => {
        if(!user) { showToast("Please login first", "WARNING"); return; }
        if(user.library.includes(movieId)) return;
        const updated = { ...user, library: [...user.library, movieId] };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        showToast("Movie Added to Library!", "SUCCESS");
    };
    const rentMovie = (movieId: string) => {
        if(!user) { showToast("Please login first", "WARNING"); return; }
        const updated = { ...user, rentals: [...user.rentals, { movieId, expiry: Date.now() + 172800000 }] }; // 48h
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        showToast("Movie Rented for 48 Hours!", "SUCCESS");
    };
    const addMovie = (movie: Movie) => {
        const newMovies = [...movies, movie];
        setMovies(newMovies);
        localStorage.setItem('movies', JSON.stringify(newMovies));
    };


    // Notification Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if(Math.random() > 0.7) {
                const msgs = ["Flash Sale! 50% off on Rentals", "New Movie 'Dune' added to Library", "Your subscription renews in 3 days"];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                setNotifications(prev => [{ id: Date.now().toString(), message: msg, read: false, type: 'INFO', timestamp: Date.now() }, ...prev]);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppContext.Provider value={{
            user, movies, theatres: MOCK_THEATRES, tickets, notifications,
            login, logout, addTicket, buyMovie, rentMovie, 
            toggleWatchlist, subscribe, addNotification: () => {}, 
            markNotificationsRead: () => setNotifications(prev => prev.map(n => ({...n, read: true}))),
            markNotificationAsRead: (id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n)),
            updateProfile: () => {}, showToast, addMovie
        }}>
            <HashRouter>
                <ScrollToTop />
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/book/:id" element={<BookingPage />} />
                        <Route path="/movie/:id" element={<MovieDetailsPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/subscription" element={<SubscriptionPage />} />
                        <Route path="/creators" element={<CreatorsInfoPage />} />
                        <Route path="/dashboard/creator" element={<CreatorDashboardPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/watchlist" element={<WatchlistPage />} />
                        <Route path="/library" element={<LibraryPage />} />
                    </Routes>
                </Layout>
                {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </HashRouter>
        </AppContext.Provider>
    );
};

export default App;