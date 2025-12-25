import StatsCards from '../components/StatsCards';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <StatsCards />
      <RecentActivity />
    </div>
  );
};

export default Dashboard;