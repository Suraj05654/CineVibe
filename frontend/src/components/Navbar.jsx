import { useEffect, useMemo, useState } from 'react';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true">
    <path d="M11 4a7 7 0 105.293 11.586l3.56 3.56a1 1 0 001.414-1.414l-3.56-3.56A7 7 0 0011 4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GuestAvatarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 20a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const Navbar = ({ onSearchOpen, myListCount, onMyListClick, user, onAvatarClick, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = useMemo(() => getInitials(user?.name || ''), [user]);

  return (
    <nav className={`pointer-events-auto fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#100428]/70 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-7">
          <img src="/logo.png" alt="CineVibe" className="h-8 w-auto" />
          <div className="hidden items-center gap-5 text-sm text-white/80 md:flex">
            <button className="hover:text-white">Browse</button>
            <button className="hover:text-white">Movies</button>
            <button className="hover:text-white">TV Shows</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchOpen}
            className="rounded-full p-2 text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-200"
            aria-label="Open search"
            type="button"
          >
            <SearchIcon />
          </button>
          <button type="button" onClick={onMyListClick} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">My List {myListCount ? `(${myListCount})` : ''}</button>
          <div className="relative">
            <button type="button" onClick={() => (user ? setMenuOpen((s) => !s) : onAvatarClick())} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-300/50 to-indigo-600/70 text-xs font-bold text-white">
              {user ? initials : <GuestAvatarIcon />}
            </button>
            {user && menuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-white/10 bg-[#120726] p-1">
                <button type="button" onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
