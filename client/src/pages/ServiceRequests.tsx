import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const mockRequests = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43211',
    requestType: 'maintenance' as const,
    description: 'Solar panel cleaning required. Efficiency has dropped by 15%.',
    priority: 'medium' as const,
    status: 'pending' as const,
    createdAt: new Date('2025-09-29T11:20:00'),
  },
  {
    id: '2',
    customerName: 'Amit Patel',
    customerPhone: '+91 98765 43212',
    requestType: 'callback' as const,
    description: 'Want to discuss system expansion from 3kW to 5kW',
    priority: 'high' as const,
    status: 'in-progress' as const,
    createdAt: new Date('2025-09-30T15:45:00'),
  },
  {
    id: '3',
    customerName: 'Sanjay Gupta',
    customerPhone: '+91 98765 43213',
    requestType: 'general' as const,
    description: 'Questions about inverter warranty',
    priority: 'low' as const,
    status: 'pending' as const,
    createdAt: new Date('2025-09-28T09:30:00'),
  },
  {
    id: '4',
    customerName: 'Neha Verma',
    customerPhone: '+91 98765 43214',
    requestType: 'maintenance' as const,
    description: 'Inverter showing error code E07',
    priority: 'high' as const,
    status: 'in-progress' as const,
    createdAt: new Date('2025-09-30T08:15:00'),
  },
];

export default function ServiceRequests() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRequests = mockRequests.filter(request => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    if (typeFilter !== "all" && request.requestType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage customer service and support requests
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-service-requests">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48" data-testid="select-filter-type">
            <SelectValue placeholder="Request type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="maintenance">Service/Maintenance</SelectItem>
            <SelectItem value="callback">Call-back</SelectItem>
            <SelectItem value="general">General Query</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {mockRequests.length} requests
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No service requests found with the selected filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <ServiceRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
