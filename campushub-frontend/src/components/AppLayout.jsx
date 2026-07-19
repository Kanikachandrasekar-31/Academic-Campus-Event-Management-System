import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
};

export default AppLayout;
