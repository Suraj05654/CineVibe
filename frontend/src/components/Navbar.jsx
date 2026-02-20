import { useEffect, useMemo, useState } from 'react';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path d="M11 4a7 7 0 1 0 4.42 12.43l4.57 4.57 1.41-1.41-4.57-4.57A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="currentColor" />
  </svg>
);

const GuestAvatar = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-6 1.79-6 4v1h12v-1c0-2.21-2.7-4-6-4Z" fill="currentColor" />
  </svg>
);

const Navbar = ({ onSearchOpen, onMyListClick, onAuthAction, onBrowseClick, myListCount, user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = useMemo(() => {
    const parts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }, [user?.name]);

  const handleAvatarClick = () => {
    if (!user) {
      onAuthAction();
      return;
    }
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className={`pointer-events-auto fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#100428]/70 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-7">
          <img src="/logo.png" alt="CineVibe" className="h-8 w-auto" />
          <div className="hidden items-center gap-5 text-sm text-white/80 md:flex">
            <button onClick={onBrowseClick} className="hover:text-white">Browse</button>
            <button onClick={onBrowseClick} className="hover:text-white">Movies</button>
            <button onClick={onBrowseClick} className="hover:text-white">TV Shows</button>
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <button
            onClick={onSearchOpen}
            className="rounded-full p-2 text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Open search"
            type="button"
          >
            <SearchIcon />
          </button>
          <button onClick={onMyListClick} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">My List {myListCount ? `(${myListCount})` : ''}</button>
          <button onClick={handleAvatarClick} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-300/50 to-indigo-600/70 text-xs font-semibold" aria-label="Profile menu">
            {user ? initials || 'U' : <GuestAvatar />}
          </button>
          {menuOpen && user && (
            <div className="absolute right-0 top-11 rounded-xl border border-white/15 bg-[#120726]/90 p-2 backdrop-blur-lg">
              <button onClick={onLogout} className="rounded-xl bg-white/15 px-3 py-1 text-sm">Logout</button>
            </div>
          )}
          {!user && <button onClick={onAuthAction} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">Login</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
