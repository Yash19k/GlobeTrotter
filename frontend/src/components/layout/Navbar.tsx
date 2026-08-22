import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Map,
  Compass as DiscoverIcon,
  Users,
  User as UserIcon,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', path: '/trips', icon: Map },
    { label: 'Discover', path: '/discover', icon: DiscoverIcon },
    { label: 'Community', path: '/community', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-surface border-b border-neutral-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              GlobeTrotter
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-semibold border-b-2 border-primary-600 rounded-b-none'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 opacity-75" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Link to="/trips/new" className="hidden sm:inline-block">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Trip
              </Button>
            </Link>

            {/* Profile Dropdown Menu */}
            <div className="relative border-l border-neutral-200 pl-3" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="User Profile Menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-extrabold text-xs overflow-hidden shrink-0">
                  {user?.profile_image ? (
                    <img src={user.profile_image} alt={user.first_name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.first_name ? user.first_name[0].toUpperCase() : user?.email[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-neutral-800 max-w-[120px] truncate">
                  {user?.first_name || user?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Dropdown Menu Overlay */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-neutral-200 rounded-2xl shadow-lg py-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Explorer'}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-neutral-400" />
                    My Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2 text-neutral-400" />
                    Settings & Preferences
                  </Link>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3 space-y-2 animate-fadeIn">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3 text-neutral-500" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <Link to="/trips/new" className="block w-full">
                <Button size="sm" className="w-full" leftIcon={<Plus className="w-4 h-4" />}>
                  New Trip
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
