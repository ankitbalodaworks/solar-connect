import { LeadCard } from '../LeadCard';

const mockLead = {
  id: '1',
  customerName: 'Rajesh Kumar',
  customerPhone: '+91 98765 43210',
  interestedIn: 'Rooftop Solar Installation - 3kW System',
  preferredSurveyDate: '15 Oct 2025',
  preferredSurveyTime: '10:00 AM',
  notes: 'Customer wants to utilize PM Surya Ghar subsidy',
  createdAt: new Date(),
};

export default function LeadCardExample() {
  return (
    <div className="p-4 max-w-md">
      <LeadCard lead={mockLead} />
    </div>
  );
}
