import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatsCards from '../components/StatsCards';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`dashboard-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />
      <div className="main-content">
        <TopBar />
        <div className="content-area">
          <StatsCards />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;