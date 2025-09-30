import { Users, MessageSquare, FileText, Wrench, Phone, Send } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendForm, setSendForm] = useState({
    customerPhone: "9646621979",
    customerName: "",
    flowType: "campaign_lead" as "campaign_lead" | "service_request",
  });
  const { toast } = useToast();

  const { data: activeConversations = [], isLoading: loadingConversations } = useQuery<Array<{
    customerPhone: string;
    customerName: string;
    flowType: string;
    currentStepKey: string;
    language: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/conversation-states"],
  });

  const { data: recentLogs = [], isLoading: loadingLogs } = useQuery<Array<{
    id: string;
    customerPhone: string;
    direction: string;
    messageType: string;
    content: any;
    status: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/whatsapp-logs"],
  });

  const handleSendMessage = async () => {
    if (!sendForm.customerPhone || !sendForm.customerName) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and customer name",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/whatsapp/send", sendForm);

      toast({
        title: "Message Sent",
        description: `WhatsApp conversation started with ${sendForm.customerName}`,
      });

      setShowSendDialog(false);
      setSendForm({ customerPhone: "9646621979", customerName: "", flowType: "campaign_lead" });
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Could not send WhatsApp message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          PM Surya Ghar Rooftop Solar Installation Management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={1234}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Campaigns"
          value={5}
          icon={MessageSquare}
        />
        <StatCard
          title="Solar Leads"
          value={89}
          icon={FileText}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Service Requests"
          value={23}
          icon={Wrench}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/customers">
              <Button className="w-full justify-start" variant="outline" data-testid="button-upload-customers">
                <Users className="h-4 w-4 mr-2" />
                Upload Customer List
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button className="w-full justify-start" variant="outline" data-testid="button-create-campaign">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create WhatsApp Campaign
              </Button>
            </Link>
            <Link href="/leads">
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-leads">
                <FileText className="h-4 w-4 mr-2" />
                View Solar Installation Leads
              </Button>
            </Link>
            <Link href="/service-requests">
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-service-requests">
                <Wrench className="h-4 w-4 mr-2" />
                Manage Service Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">New Solar Installation Lead</p>
                <p className="text-xs text-muted-foreground truncate">राजेश कुमार - 3kW सिस्टम इंस्टॉलेशन</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">PM Surya Ghar</Badge>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Campaign Sent</p>
                <p className="text-xs text-muted-foreground truncate">PM Surya Ghar Awareness - 156 recipients</p>
                <span className="text-xs text-muted-foreground mt-1 block">5 hours ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Service Request</p>
                <p className="text-xs text-muted-foreground truncate">प्रिया शर्मा - पैनल क्लीनिंग</p>
                <span className="text-xs text-muted-foreground mt-1 block">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PM Surya Ghar Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Summer Solar Installation Drive</span>
                <span className="text-sm text-muted-foreground">156 sent</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">68% delivery rate • 42 leads generated</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">PM Surya Ghar Subsidy Awareness</span>
                <span className="text-sm text-muted-foreground">203 sent</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">85% delivery rate • 67 leads generated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg">Active WhatsApp Conversations</CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowSendDialog(true)}
              data-testid="button-send-whatsapp"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardHeader>
          <CardContent>
            {loadingConversations ? (
              <p className="text-sm text-muted-foreground">Loading conversations...</p>
            ) : activeConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active conversations</p>
            ) : (
              <div className="space-y-3">
                {activeConversations.slice(0, 5).map((conv) => (
                  <Link key={conv.customerPhone} href={`/conversations/${conv.customerPhone}`}>
                    <div className="flex items-start gap-3 pb-3 border-b last:border-0 hover-elevate cursor-pointer rounded-md p-2 -m-2" data-testid={`conversation-${conv.customerPhone}`}>
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" data-testid={`text-conversation-name-${conv.customerPhone}`}>{conv.customerName}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-conversation-phone-${conv.customerPhone}`}>{conv.customerPhone}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-conversation-type-${conv.customerPhone}`}>
                            {conv.flowType === "campaign_lead" ? "Campaign" : "Service"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-conversation-step-${conv.customerPhone}`}>
                            {conv.currentStepKey.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground" data-testid={`text-conversation-language-${conv.customerPhone}`}>{conv.language}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent WhatsApp Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            ) : recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0" data-testid={`whatsapp-log-${log.id}`}>
                    <div className={`h-8 w-8 rounded-full ${
                      log.direction === "outbound" 
                        ? "bg-green-100 dark:bg-green-950" 
                        : "bg-purple-100 dark:bg-purple-950"
                    } flex items-center justify-center flex-shrink-0`}>
                      <MessageSquare className={`h-4 w-4 ${
                        log.direction === "outbound"
                          ? "text-green-600 dark:text-green-400"
                          : "text-purple-600 dark:text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" data-testid={`text-log-direction-${log.id}`}>
                        {log.direction === "outbound" ? "Sent" : "Received"} {log.messageType}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" data-testid={`text-log-phone-${log.id}`}>{log.customerPhone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            log.status === "sent" ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400" :
                            log.status === "delivered" ? "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400" :
                            log.status === "failed" ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400" :
                            ""
                          }`}
                          data-testid={`badge-log-status-${log.id}`}
                        >
                          {log.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground" data-testid={`text-log-time-${log.id}`}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent data-testid="dialog-send-whatsapp">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Start a new WhatsApp conversation with a customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerPhone">Customer Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="919876543210"
                value={sendForm.customerPhone}
                onChange={(e) => setSendForm({ ...sendForm, customerPhone: e.target.value })}
                data-testid="input-customer-phone"
              />
              <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., 91 for India)</p>
            </div>
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="राजेश कुमार"
                value={sendForm.customerName}
                onChange={(e) => setSendForm({ ...sendForm, customerName: e.target.value })}
                data-testid="input-customer-name"
              />
            </div>
            <div>
              <Label htmlFor="flowType">Message Type</Label>
              <Select
                value={sendForm.flowType}
                onValueChange={(value) => setSendForm({ ...sendForm, flowType: value as "campaign_lead" | "service_request" })}
              >
                <SelectTrigger id="flowType" data-testid="select-flow-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign_lead">Campaign Lead</SelectItem>
                  <SelectItem value="service_request">Service Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowSendDialog(false)}
                data-testid="button-cancel-send"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                data-testid="button-confirm-send"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
