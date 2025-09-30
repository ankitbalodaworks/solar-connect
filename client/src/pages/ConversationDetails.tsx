import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { type ConversationState, type WhatsappLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Phone, User, MessageSquare, ChevronDown, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const FLOW_STEPS = {
  campaign_lead: [
    { key: "language_select", label: "Language Selection" },
    { key: "offer", label: "Offer Presentation" },
    { key: "survey_schedule", label: "Survey Scheduling" },
    { key: "complete", label: "Complete" },
  ],
  service_request: [
    { key: "language_select", label: "Language Selection" },
    { key: "service_menu", label: "Service Menu" },
    { key: "problem_description", label: "Problem Description" },
    { key: "urgency_select", label: "Urgency Selection" },
    { key: "complete", label: "Complete" },
  ],
};

const formatContextValue = (key: string, value: any): string => {
  if (typeof value === "object" && value !== null) {
    if (value.buttonId) return value.buttonId;
    if (value.itemId) return value.itemId;
    if (value.text) return value.text;
    return JSON.stringify(value);
  }
  return String(value);
};

const getStepLabel = (stepKey: string): string => {
  return stepKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ConversationDetails() {
  const [, params] = useRoute("/conversations/:phone");
  const phone = params?.phone || "";

  const { data: conversation, isLoading: loadingConversation } = useQuery<ConversationState>({
    queryKey: ["/api/conversation-states", { phone }],
    queryFn: async () => {
      const res = await fetch(`/api/conversation-states?phone=${phone}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!phone,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<WhatsappLog[]>({
    queryKey: ["/api/whatsapp-logs", { phone }],
    queryFn: async () => {
      const res = await fetch(`/api/whatsapp-logs?customerPhone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!phone,
  });

  if (!phone) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No phone number provided</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingConversation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading conversation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Conversation not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flowSteps = FLOW_STEPS[conversation.flowType as keyof typeof FLOW_STEPS] || [];
  const currentStepIndex = flowSteps.findIndex((s) => s.key === conversation.currentStep);
  const context = conversation.context as Record<string, any> || {};

  const getDirectionBadge = (direction: string) => {
    if (direction === "inbound") {
      return (
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          Inbound
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
        Outbound
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, string> = {
      sent: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      delivered: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
      read: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
      failed: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold mb-1">Conversation Details</h1>
            <p className="text-sm text-muted-foreground">
              WhatsApp conversation with {conversation.customerName}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium" data-testid="text-customer-name">{conversation.customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium" data-testid="text-phone-number">{conversation.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flow Type</p>
                <Badge variant="secondary" data-testid="badge-flow-type">
                  {conversation.flowType === "campaign_lead" ? "Campaign Lead" : "Service Request"}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Step</p>
                <Badge variant="outline" data-testid="badge-current-step">
                  {getStepLabel(conversation.currentStep)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Flow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap" data-testid="flow-progress">
            {flowSteps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {index <= currentStepIndex ? (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      {index + 1}
                    </div>
                  )}
                  <span
                    className={`text-sm ${index <= currentStepIndex ? "font-medium" : "text-muted-foreground"}`}
                    data-testid={`step-${step.key}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collected Data</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(context).length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="text-no-data">No data collected yet</p>
          ) : (
            <div className="space-y-3" data-testid="collected-data">
              {Object.entries(context).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{getStepLabel(key)}</p>
                    <p className="text-sm mt-1" data-testid={`data-${key}`}>
                      {formatContextValue(key, value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMessages ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="text-no-messages">No messages yet</p>
          ) : (
            <div className="space-y-4" data-testid="message-history">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-3 pb-4 border-b last:border-0"
                  data-testid={`message-${message.id}`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getDirectionBadge(message.direction)}
                      <Badge variant="outline" data-testid={`message-type-${message.id}`}>
                        {message.messageType}
                      </Badge>
                      {message.status && getStatusBadge(message.status)}
                      <span className="text-xs text-muted-foreground" data-testid={`message-time-${message.id}`}>
                        {format(new Date(message.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <div className="text-sm" data-testid={`message-content-${message.id}`}>
                      {typeof message.content === "object" && message.content !== null ? (
                        <div className="space-y-1">
                          {(message.content as any).bodyText && (
                            <p>{(message.content as any).bodyText}</p>
                          )}
                          {(message.content as any).text && (
                            <p>{(message.content as any).text}</p>
                          )}
                          {(message.content as any).buttonId && (
                            <p className="text-muted-foreground">Selected: {(message.content as any).buttonId}</p>
                          )}
                        </div>
                      ) : (
                        <p>{String(message.content)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Collapsible>
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="w-full" data-testid="button-toggle-raw-context">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Raw Context (Debug)</CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto" data-testid="raw-context">
                {JSON.stringify(conversation.context, null, 2)}
              </pre>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
