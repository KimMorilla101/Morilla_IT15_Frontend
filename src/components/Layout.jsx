import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './common/Navbar';
import '../styles/Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout d-flex">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <main className="main-content container-fluid px-3 px-md-4">
        <Outlet />
      </main>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </div>
  );
};

export default Layout;
