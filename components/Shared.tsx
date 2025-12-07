import React, { useEffect, useState, useRef } from 'react';
import { Movie, Ticket } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants = {
    primary: "bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/40",
    secondary: "bg-brand-gray hover:bg-gray-600 text-white hover:shadow-lg",
    outline: "border-2 border-white/20 hover:border-white text-white bg-transparent hover:bg-white/5",
    danger: "bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900",
    gold: "bg-brand-gold text-black hover:bg-yellow-400 shadow-lg shadow-yellow-900/20 hover:shadow-yellow-900/40"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, onClose, title, children 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 animate-fade-in">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-in origin-center">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

export const Toast: React.FC<{ message: string; type?: 'INFO' | 'SUCCESS' | 'WARNING'; onClose: () => void }> = ({ message, type = 'INFO', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        INFO: 'bg-blue-600',
        SUCCESS: 'bg-green-600',
        WARNING: 'bg-brand-gold text-black'
    };

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] ${colors[type]} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in-down min-w-[320px] max-w-md border border-white/10 backdrop-blur-xl`}>
            <i className={`fa-solid ${type === 'SUCCESS' ? 'fa-check-circle' : type === 'WARNING' ? 'fa-exclamation-triangle' : 'fa-info-circle'} text-xl`}></i>
            <div className="flex-1">
                <p className="font-bold text-sm whitespace-pre-wrap">{message}</p>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100"><i className="fa-solid fa-xmark"></i></button>
        </div>
    );
};

export const HorizontalScrollContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth ? current.clientWidth / 2 : 300;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <button 
        onClick={() => scroll('left')} 
        className="hidden md:flex absolute left-0 top-0 bottom-6 z-30 w-16 bg-gradient-to-r from-black/80 to-transparent items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-black/90 pointer-events-none group-hover:pointer-events-auto"
        aria-label="Scroll Left"
      >
        <i className="fa-solid fa-chevron-left text-3xl text-white hover:scale-125 transition-transform drop-shadow-md"></i>
      </button>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x scroll-smooth px-1">
        {children}
      </div>

      <button 
        onClick={() => scroll('right')} 
        className="hidden md:flex absolute right-0 top-0 bottom-6 z-30 w-16 bg-gradient-to-l from-black/80 to-transparent items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-black/90 pointer-events-none group-hover:pointer-events-auto"
        aria-label="Scroll Right"
      >
        <i className="fa-solid fa-chevron-right text-3xl text-white hover:scale-125 transition-transform drop-shadow-md"></i>
      </button>
    </div>
  );
};


export const MovieCard: React.FC<{ 
  movie: Movie; 
  onClick: () => void; 
  onToggleWatchlist?: (e: React.MouseEvent) => void; 
  isInWatchlist?: boolean;
  badge?: string;
  badgeColor?: string;
}> = ({ movie, onClick, onToggleWatchlist, isInWatchlist, badge, badgeColor }) => (
  <div 
    onClick={onClick}
    className="group relative bg-brand-gray rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-xl min-w-[160px] md:min-w-[200px] border border-white/5 hover:border-brand-red/50 hover:shadow-brand-red/10"
  >
    {/* Image - Blurs slightly on hover of THIS card only */}
    <img 
        src={movie.poster} 
        alt={movie.title} 
        className="w-full h-[240px] md:h-[300px] object-cover transition-all duration-500 group-hover:blur-[2px] group-hover:scale-110 z-0" 
    />
    
    {/* Gradient Overlay for Text Readability - Always visible but subtle */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 transition-opacity duration-300 z-10" />
    
    {/* Play Button Overlay - Visible on hover, darkens bg slightly, Z-10 */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 z-10 backdrop-blur-[1px]">
        <div className="w-16 h-16 rounded-full bg-brand-red/90 flex items-center justify-center shadow-lg shadow-brand-red/50 transform scale-50 group-hover:scale-100 transition-transform duration-300">
             <i className="fa-solid fa-play text-2xl text-white ml-1"></i>
        </div>
    </div>

    {/* Badge (e.g., In Theatres) */}
    {badge && (
         <div className={`absolute top-2 right-2 z-20 ${badgeColor || 'bg-brand-red'} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider`}>
            {badge}
         </div>
    )}

    {/* Watchlist Icon - Z-30 to be clickable */}
    {onToggleWatchlist && (
      <button 
        onClick={onToggleWatchlist}
        className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-red transition-colors z-30 hover:scale-110 group/btn"
      >
        <i className={`${isInWatchlist ? 'fa-solid text-brand-red group-hover/btn:text-white' : 'fa-regular'} fa-heart text-sm`}></i>
      </button>
    )}

    {/* Text Content - Z-20 to sit ON TOP of the blur/overlay so it remains sharp */}
    <div className="absolute bottom-0 left-0 p-3 w-full z-20">
      <h3 className="text-white font-bold truncate drop-shadow-md text-sm md:text-base leading-tight">{movie.title}</h3>
      <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
        <span className="flex items-center gap-1"><i className="fa-solid fa-star text-brand-gold text-[10px]"></i> {movie.rating > 0 ? movie.rating : 'NR'}</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{movie.genre[0]}</span>
      </div>
    </div>
  </div>
);

export const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  <div className="bg-gradient-to-r from-brand-gray to-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 border-l-4 border-brand-red shadow-lg mb-4 hover:shadow-brand-red/10 transition-all hover:translate-x-1 group">
    <div className="flex-1">
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-red transition-colors">{ticket.movieTitle}</h3>
      <p className="text-gray-400 text-sm mb-2"><i className="fa-solid fa-location-dot mr-2"></i>{ticket.theatreName}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
        <span className="bg-black/30 px-2 py-1 rounded border border-white/5"><i className="fa-regular fa-calendar mr-2"></i>{ticket.date}</span>
        <span className="bg-black/30 px-2 py-1 rounded border border-white/5"><i className="fa-regular fa-clock mr-2"></i>{ticket.time}</span>
      </div>
      <div className="mt-3">
        <span className="text-gray-400 text-xs uppercase tracking-wider">Seats</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {ticket.seats.map(s => (
            <span key={s} className="text-brand-gold font-mono font-bold bg-brand-gold/10 px-2 py-1 rounded text-xs border border-brand-gold/20">{s}</span>
          ))}
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-4">
      <div className="bg-white p-2 rounded shadow-inner hover:scale-105 transition-transform duration-300">
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.qrCode}`} alt="QR" className="w-20 h-20" />
      </div>
      <span className="text-xs text-gray-500 mt-2 font-mono tracking-widest">{ticket.id.slice(0,8)}</span>
    </div>
  </div>
);

export const SimpleLineChart: React.FC<{ data: any[], dataKey: string }> = ({ data, dataKey }) => (
  <div className="h-64 w-full bg-brand-gray p-4 rounded-xl border border-white/5 hover:border-white/10 transition">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="name" stroke="#888" tick={{fontSize: 12}} />
        <YAxis stroke="#888" tick={{fontSize: 12}} />
        <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} itemStyle={{color: '#E50914'}} />
        <Line type="monotone" dataKey={dataKey} stroke="#E50914" strokeWidth={3} activeDot={{ r: 6, fill: '#fff' }} dot={{fill: '#E50914'}} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const SimpleBarChart: React.FC<{ data: any[], dataKey: string }> = ({ data, dataKey }) => (
    <div className="h-64 w-full bg-brand-gray p-4 rounded-xl border border-white/5 hover:border-white/10 transition">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis dataKey="name" stroke="#888" tick={{fontSize: 12}} />
          <YAxis stroke="#888" tick={{fontSize: 12}} />
          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
          <Bar dataKey={dataKey} fill="#E50914" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );