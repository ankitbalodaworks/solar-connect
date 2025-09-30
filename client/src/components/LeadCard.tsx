import { Calendar, Clock, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeadCardProps {
  lead: {
    id: string;
    customerName: string;
    customerPhone: string;
    interestedIn: string;
    preferredSurveyDate?: string;
    preferredSurveyTime?: string;
    notes?: string;
    createdAt: Date;
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card className="border-l-4 border-l-primary" data-testid={`card-lead-${lead.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold" data-testid={`text-lead-name-${lead.id}`}>
                {lead.customerName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {lead.customerPhone}
            </div>
          </div>
          <Badge variant="secondary">New Lead</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Interested In</p>
          <p className="text-sm font-medium">{lead.interestedIn}</p>
        </div>
        
        {lead.preferredSurveyDate && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{lead.preferredSurveyDate}</span>
            </div>
            {lead.preferredSurveyTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{lead.preferredSurveyTime}</span>
              </div>
            )}
          </div>
        )}

        {lead.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{lead.notes}</p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Received {new Date(lead.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
