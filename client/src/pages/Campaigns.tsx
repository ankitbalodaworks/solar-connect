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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

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
                      <TableRow 
                        key={campaign.id} 
                        data-testid={`row-campaign-${campaign.id}`}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendCampaign(campaign.id);
                                }}
                                data-testid={`button-send-${campaign.id}`}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCampaign(campaign);
                                }}
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

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-campaign-details">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Campaign ID</p>
                  <p className="font-mono text-sm">{selectedCampaign.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created Date</p>
                  <p>{selectedCampaign.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Campaign Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Campaign Name</p>
                    <p className="font-medium">{selectedCampaign.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge variant={selectedCampaign.status === 'sent' ? 'default' : 'secondary'}>
                        {selectedCampaign.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Target Threshold</p>
                      <Badge variant="outline">≥{selectedCampaign.threshold} units</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Message Content</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedCampaign.message}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Delivery Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Recipients</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">{selectedCampaign.recipientCount}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Messages Sent</p>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">{selectedCampaign.sentCount}</p>
                    </div>
                  </div>
                </div>
                {selectedCampaign.status === 'sent' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Delivery Rate</span>
                      <span className="text-sm font-medium">
                        {Math.round((selectedCampaign.sentCount / selectedCampaign.recipientCount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(selectedCampaign.sentCount / selectedCampaign.recipientCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
