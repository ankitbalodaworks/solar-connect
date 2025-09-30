import { ServiceRequestCard } from '../ServiceRequestCard';

const mockRequests = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43211',
    requestType: 'maintenance' as const,
    description: 'Solar panel cleaning required',
    priority: 'medium' as const,
    status: 'pending' as const,
    createdAt: new Date(),
  },
  {
    id: '2',
    customerName: 'Amit Patel',
    customerPhone: '+91 98765 43212',
    requestType: 'callback' as const,
    description: 'Want to discuss system expansion',
    priority: 'high' as const,
    status: 'in-progress' as const,
    createdAt: new Date(),
  },
];

export default function ServiceRequestCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {mockRequests.map(request => (
        <ServiceRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
