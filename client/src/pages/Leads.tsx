import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockLeads = [
  {
    id: '1',
    customerName: 'राजेश कुमार',
    customerPhone: '+91 98765 43210',
    customerVillage: 'गांव: वैशाली नगर, जयपुर',
    systemCapacity: '3kW',
    roofType: 'RCC',
    preferredSurveyDate: '15 Oct 2025',
    preferredSurveyTime: '10:00 AM',
    notes: 'PM Surya Ghar योजना के तहत सब्सिडी चाहते हैं',
    createdAt: new Date('2025-09-28T10:30:00'),
  },
  {
    id: '2',
    customerName: 'प्रिया शर्मा',
    customerPhone: '+91 98765 43211',
    customerVillage: 'गांव: मालवीय नगर, जयपुर',
    systemCapacity: '2kW',
    roofType: 'Tin',
    preferredSurveyDate: '18 Oct 2025',
    preferredSurveyTime: '2:00 PM',
    notes: '',
    createdAt: new Date('2025-09-29T14:15:00'),
  },
  {
    id: '3',
    customerName: 'अमित पटेल',
    customerPhone: '+91 98765 43212',
    customerVillage: 'गांव: सी-स्कीम, जयपुर',
    systemCapacity: '5kW',
    roofType: 'RCC',
    preferredSurveyDate: '20 Oct 2025',
    preferredSurveyTime: '11:00 AM',
    notes: 'व्यावसायिक संपत्ति, ROI गणना आवश्यक',
    createdAt: new Date('2025-09-30T09:45:00'),
  },
];

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = mockLeads.filter(lead => 
    lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.customerPhone.includes(searchQuery) ||
    lead.customerVillage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Leads</h1>
          <p className="text-sm text-muted-foreground">
            All interested customers for PM Surya Ghar solar installation
          </p>
        </div>
        <Button variant="outline" size="sm" data-testid="button-export-leads">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>System Capacity</TableHead>
                  <TableHead>Roof Type</TableHead>
                  <TableHead>Survey Schedule</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No leads found. Start a campaign to generate leads.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.customerName}</div>
                          <div className="text-sm text-muted-foreground">{lead.customerPhone}</div>
                          <div className="text-xs text-muted-foreground">{lead.customerVillage}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                          {lead.systemCapacity}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.roofType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.preferredSurveyDate}</div>
                          <div className="text-muted-foreground">{lead.preferredSurveyTime}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="line-clamp-2 text-sm">
                          {lead.notes || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                          New Lead
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" data-testid={`button-view-${lead.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-${lead.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1-{filteredLeads.length} of {filteredLeads.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled data-testid="button-previous">
                Previous
              </Button>
              <Button variant="default" size="sm" data-testid="button-page-1">
                1
              </Button>
              <Button variant="outline" size="sm" disabled data-testid="button-next">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
