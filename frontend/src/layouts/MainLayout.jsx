import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
