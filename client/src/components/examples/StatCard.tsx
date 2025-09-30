import { StatCard } from '../StatCard';
import { Users, MessageSquare, FileText } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Customers"
        value={1234}
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Active Campaigns"
        value={5}
        icon={MessageSquare}
      />
      <StatCard
        title="Leads Generated"
        value={89}
        icon={FileText}
        trend={{ value: 24, isPositive: true }}
      />
    </div>
  );
}
