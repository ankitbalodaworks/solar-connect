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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedLead, setSelectedLead] = useState<any>(null);

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
                  <TableHead>Survey Schedule</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No leads found. Start a campaign to generate leads.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      data-testid={`row-lead-${lead.id}`}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedLead(lead)}
                    >
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            data-testid={`button-view-${lead.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            data-testid={`button-edit-${lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
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

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-lead-details">
          <DialogHeader>
            <DialogTitle>Lead Details - PM Surya Ghar Installation</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lead ID</p>
                  <p className="font-mono text-sm">{selectedLead.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created Date</p>
                  <p>{selectedLead.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{selectedLead.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p>{selectedLead.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Village/Location</p>
                    <p>{selectedLead.customerVillage}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Installation Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">System Capacity</p>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                      {selectedLead.systemCapacity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Roof Type</p>
                    <p>{selectedLead.roofType}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Survey Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Preferred Date</p>
                    <p>{selectedLead.preferredSurveyDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Preferred Time</p>
                    <p>{selectedLead.preferredSurveyTime}</p>
                  </div>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Additional Notes</h3>
                  <p className="text-sm leading-relaxed bg-muted p-3 rounded-md">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
