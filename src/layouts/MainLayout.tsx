import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-1 mb-16 lg:mb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
