import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, ShoppingBag, FileText, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { name: 'Trang Chủ', path: '/', icon: Home },
    { name: 'Dịch Vụ', path: '/services', icon: Layers },
    { name: 'Đặt Đơn', path: '/order', icon: ShoppingBag, highlight: true },
    { name: 'Đơn Hàng', path: '/orders', icon: FileText },
    { name: 'Tài Khoản', path: '/account', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                  item.highlight
                    ? isActive
                      ? 'text-white'
                      : 'text-primary-light'
                    : isActive
                    ? 'text-primary-light font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.highlight ? (
                    <div
                      className={`-mt-5 p-3 rounded-2xl shadow-glow-primary transition-transform ${
                        isActive
                          ? 'bg-gradient-to-tr from-primary to-violet-500 text-white scale-110'
                          : 'bg-primary text-white hover:scale-105'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 mb-0.5" />
                  )}
                  <span className="text-[10px] font-medium tracking-tight mt-0.5">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
