import { useState } from "react";
import { CampaignForm } from "@/components/CampaignForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Send } from "lucide-react";

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
        <h1 className="text-3xl font-semibold mb-2">Campaigns</h1>
        <p className="text-muted-foreground">
          Create and manage WhatsApp marketing campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignForm totalCustomers={156} onSubmit={handleCreateCampaign} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No campaigns yet. Create your first campaign to get started.
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                  <div>
                    <CardTitle className="text-base mb-1">{campaign.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Badge 
                    variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                    data-testid={`badge-status-${campaign.id}`}
                  >
                    {campaign.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm line-clamp-2">{campaign.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.recipientCount} recipients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>≥{campaign.threshold} units</span>
                    </div>
                  </div>

                  {campaign.status === 'draft' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSendCampaign(campaign.id)}
                      data-testid={`button-send-${campaign.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Campaign
                    </Button>
                  )}

                  {campaign.status === 'sent' && (
                    <div className="text-sm text-muted-foreground">
                      Sent to {campaign.sentCount} customers
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
