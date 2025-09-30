import { useState } from "react";
import { CampaignForm } from "@/components/CampaignForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Send, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const handleCreateCampaign = (data: any) => {
    const newCampaign = {
      id: String(campaigns.length + 1),
      ...data,
      status: 'draft',
      recipientCount: 156,
      sentCount: 0,
      createdAt: new Date(),
    };
    setCampaigns([newCampaign, ...campaigns]);
    console.log('Campaign created:', newCampaign);
  };

  const handleSendCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: 'sent', sentCount: c.recipientCount } : c
    ));
    console.log('Campaign sent:', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Campaigns</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage WhatsApp campaigns for PM Surya Ghar solar installations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignForm totalCustomers={156} onSubmit={handleCreateCampaign} />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Campaign History</h2>
          
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No campaigns yet. Create your first campaign to reach customers.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{campaign.recipientCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">≥{campaign.threshold} units</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                            data-testid={`badge-status-${campaign.id}`}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {campaign.status === 'draft' ? (
                              <Button 
                                size="sm"
                                onClick={() => handleSendCampaign(campaign.id)}
                                data-testid={`button-send-${campaign.id}`}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                data-testid={`button-view-${campaign.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
