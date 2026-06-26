import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Map,
  User,
  LogOut,
  Menu,
  X,
  BrainCircuit,
  Rocket,
  ChevronLeft,
  Settings,
  Users,
  TrendingUp,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AuthSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, handleLogOut } = useApp();

  const handleLogoutClick = async () => {
    setIsMobileOpen(false);
    await handleLogOut();
    navigate('/');
  };

  const navItems = profile?.role === 'admin'
    ? [
      { name: 'Talent Directory', path: '/admin/talent', icon: Users },
      { name: 'Cohort Analytics', path: '/admin/analytics', icon: TrendingUp },
      { name: 'Competency Models', path: '/admin/roles', icon: Settings },
      { name: 'Curriculum Resources', path: '/admin/resources', icon: Database }
    ]
    : [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Start Assessment', path: '/upload', icon: Rocket },
      { name: 'Pathway', path: '/pathwaypage', icon: Map },
    ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-8">
        {/* Brand logo */}
        <div className="flex items-center justify-between px-2">
          <div>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-xl bg-stone-900 text-white group-hover:bg-stone-850 transition-colors">
                <BrainCircuit size={18} />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-stone-900">Neural<span className="text-amber-600">Path</span></span>
            </Link>
            <div className="mt-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest pl-1">
              Core Learning OS
            </div>
          </div>

          {/* Collapse button for desktop */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-stone-100 text-stone-900 font-bold hover:text-stone-900 transition-colors border border-stone-205 cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        </div>

        {/* Navigation items */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-3.5 border ${isActive
                  ? 'bg-stone-900 border-stone-850 text-white shadow-md shadow-stone-950/10'
                  : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
              >
                <IconComponent size={16} className={isActive ? 'text-amber-500' : 'text-stone-500'} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.span
                    layoutId="sidebarActiveIndicator"
                    className="ml-auto w-1 h-3 rounded-full bg-amber-500"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User profile preview badge */}
      <div className="border-t border-stone-200/80 pt-4 px-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 border border-amber-200/60 flex items-center justify-center font-bold text-xs shadow-sm shadow-amber-900/5 uppercase">
            {profile?.name ? profile.name.substring(0, 2) : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-stone-900 truncate">{profile?.name || user?.displayName || 'User'}</div>
            <div className="text-[10px] text-stone-400 font-semibold truncate">{profile?.email || user?.email || 'authenticated'}</div>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full py-2 px-3 hover:bg-stone-100 rounded-lg text-[11px] font-bold text-stone-500 hover:text-stone-950 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut size={13} className="text-stone-400" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 border-r border-stone-200/80 bg-[#FCFBF9] hidden md:block z-40 transition-transform duration-300 ease-in-out ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sticky Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#FCFBF9]/90 backdrop-blur-md border-b border-stone-200/60 flex items-center justify-between px-4 md:hidden z-40">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-xl bg-stone-900 text-white">
            <BrainCircuit size={16} />
          </div>
          <span className="font-extrabold text-base tracking-tight text-stone-900">Neural<span className="text-amber-600">Path</span></span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none cursor-pointer"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-stone-900"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-[#FCFBF9] border-r border-stone-200 shadow-2xl"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-205 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
