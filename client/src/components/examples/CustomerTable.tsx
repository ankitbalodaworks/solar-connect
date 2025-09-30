import { CustomerTable } from '../CustomerTable';

const mockCustomers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    address: 'Vaishali Nagar, Jaipur',
    electricityConsumption: 320,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '+91 98765 43211',
    address: 'Malviya Nagar, Jaipur',
    electricityConsumption: 250,
  },
  {
    id: '3',
    name: 'Amit Patel',
    phone: '+91 98765 43212',
    address: 'C-Scheme, Jaipur',
    electricityConsumption: 180,
  },
];

export default function CustomerTableExample() {
  return (
    <div className="p-4">
      <CustomerTable 
        customers={mockCustomers}
        onDelete={(id) => console.log('Delete customer:', id)}
      />
    </div>
  );
}
