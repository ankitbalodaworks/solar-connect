import { LeadCard } from "@/components/LeadCard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const mockLeads = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    interestedIn: 'Rooftop Solar Installation - 3kW System',
    preferredSurveyDate: '15 Oct 2025',
    preferredSurveyTime: '10:00 AM',
    notes: 'Customer wants to utilize PM Surya Ghar subsidy. Interested in net metering.',
    createdAt: new Date('2025-09-28T10:30:00'),
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43211',
    interestedIn: 'Solar Water Heater',
    preferredSurveyDate: '18 Oct 2025',
    preferredSurveyTime: '2:00 PM',
    createdAt: new Date('2025-09-29T14:15:00'),
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    customerPhone: '+91 98765 43212',
    interestedIn: 'Rooftop Solar Installation - 5kW System',
    preferredSurveyDate: '20 Oct 2025',
    preferredSurveyTime: '11:00 AM',
    notes: 'Commercial property. Needs ROI calculation.',
    createdAt: new Date('2025-09-30T09:45:00'),
  },
];

export default function Leads() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Leads</h1>
          <p className="text-muted-foreground">
            All interested customers from WhatsApp campaigns
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-leads">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {mockLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No leads captured yet. Start a campaign to generate leads.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
