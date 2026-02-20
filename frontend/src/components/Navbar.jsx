import { useEffect, useState } from 'react';

const Navbar = ({ onSearchOpen, myListCount }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#100428]/70 backdrop-blur-lg' : 'bg-transparent'}`}>
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
          <button onClick={onSearchOpen} className="rounded-full p-2 text-white/90 hover:bg-white/10" aria-label="Open search">🔍</button>
          <button className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">My List {myListCount ? `(${myListCount})` : ''}</button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-300/50 to-indigo-600/70" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
