import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatsCards from '../components/StatsCards';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
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