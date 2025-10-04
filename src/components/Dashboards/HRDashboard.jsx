// in src/components/HRDashboard.jsx
import ResumeScreener from "../ResumeScreener";
import CopilotWidget from "../CopilotWidget";
// A simple component for a statistic card
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

export default function HRDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">HR Recruiter Dashboard</h2>
        <p className="text-gray-500 mt-1">Recruitment tools and analytics at your fingertips.</p>
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Open Positions" value="12" />
        <StatCard title="Candidates Screened Today" value="8" />
        <StatCard title="Interviews Scheduled" value="3" />
      </div>

      {/* Resume Screener Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* We are placing our existing ResumeScreener component inside this new dashboard */}
        <ResumeScreener />
      </div>
      <div>
        <CopilotWidget />
      </div>
    </div>
  );
}