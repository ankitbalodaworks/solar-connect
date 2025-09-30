import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { type ConversationState } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Search, Eye, Phone, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Conversations() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("");

  const { data: conversations = [], isLoading } = useQuery<ConversationState[]>({
    queryKey: ["/api/conversation-states"],
  });

  // Sync selectedPerson with URL params (handles mount + browser back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const phoneParam = params.get("phone");
    setSelectedPerson(phoneParam || "");
  }, [location]);

  // Update URL when selectedPerson changes (via user interaction)
  const handlePersonChange = (value: string) => {
    setSelectedPerson(value);
    if (value) {
      setLocation(`/conversations?phone=${encodeURIComponent(value)}`, { replace: true });
    } else {
      setLocation("/conversations", { replace: true });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone.includes(searchQuery);
    
    const matchesPerson = selectedPerson ? conv.customerPhone === selectedPerson : true;

    return matchesSearch && matchesPerson;
  });

  const handleClearPerson = () => {
    handlePersonChange("");
  };

  const getStepLabel = (stepKey: string): string => {
    return stepKey
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-conversations">
            Conversations
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all WhatsApp conversations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4 pb-4">
          <CardTitle className="text-lg">Active Conversations</CardTitle>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-conversations"
              />
            </div>
            <div className="flex gap-2 min-w-[250px]">
              <Select 
                value={selectedPerson} 
                onValueChange={handlePersonChange}
              >
                <SelectTrigger data-testid="select-person-filter">
                  <SelectValue placeholder="Filter by person..." />
                </SelectTrigger>
                <SelectContent>
                  {conversations.map((conv) => (
                    <SelectItem 
                      key={conv.customerPhone} 
                      value={conv.customerPhone}
                      data-testid={`select-person-${conv.customerPhone}`}
                    >
                      {conv.customerName} ({conv.customerPhone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPerson && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleClearPerson}
                  data-testid="button-clear-person-filter"
                  title="Clear filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {selectedPerson && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="badge-filtered-person">
                Filtered: {conversations.find(c => c.customerPhone === selectedPerson)?.customerName || selectedPerson}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Flow Type</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conversation) => (
                    <TableRow
                      key={conversation.customerPhone}
                      data-testid={`row-conversation-${conversation.customerPhone}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p
                              className="font-medium text-sm"
                              data-testid={`text-conversation-name-${conversation.customerPhone}`}
                            >
                              {conversation.customerName}
                            </p>
                            <p
                              className="text-xs text-muted-foreground flex items-center gap-1"
                              data-testid={`text-conversation-phone-${conversation.customerPhone}`}
                            >
                              <Phone className="h-3 w-3" />
                              {conversation.customerPhone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          data-testid={`badge-flow-type-${conversation.customerPhone}`}
                        >
                          {conversation.flowType === "campaign_lead"
                            ? "Campaign"
                            : "Service"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          data-testid={`badge-current-step-${conversation.customerPhone}`}
                        >
                          {getStepLabel(conversation.currentStep)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-sm capitalize"
                          data-testid={`text-language-${conversation.customerPhone}`}
                        >
                          {conversation.language}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-sm text-muted-foreground"
                          data-testid={`text-created-${conversation.customerPhone}`}
                        >
                          {format(new Date(conversation.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/conversations/${conversation.customerPhone}`}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            data-testid={`button-view-${conversation.customerPhone}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
