import { Wrench, Phone as PhoneCall, HelpCircle, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceRequestCardProps {
  request: {
    id: string;
    customerName: string;
    customerPhone: string;
    requestType: "maintenance" | "callback" | "general";
    description?: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "in-progress" | "completed";
    createdAt: Date;
  };
}

export function ServiceRequestCard({ request }: ServiceRequestCardProps) {
  const typeConfig = {
    maintenance: { icon: Wrench, label: "Service/Maintenance", color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    callback: { icon: PhoneCall, label: "Request Call-back", color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
    general: { icon: HelpCircle, label: "General Query", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
  };

  const priorityConfig = {
    low: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
    medium: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
    high: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  };

  const statusConfig = {
    pending: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
    "in-progress": "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
    completed: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  };

  const typeInfo = typeConfig[request.requestType];
  const TypeIcon = typeInfo.icon;

  return (
    <Card data-testid={`card-service-${request.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-md ${typeInfo.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{typeInfo.label}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                {request.customerName}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={statusConfig[request.status]}>
              {request.status}
            </Badge>
            <Badge className={priorityConfig[request.priority]} variant="outline">
              {request.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span>{request.customerPhone}</span>
        </div>

        {request.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{request.description}</p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Requested {new Date(request.createdAt).toLocaleDateString('en-IN', {
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
