import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export function WhatsAppStatus() {
  const { data, isLoading } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ["/api/whatsapp/status"],
    refetchInterval: 30000,
  });

  const status = isLoading ? "connecting" : data?.configured ? "connected" : "disconnected";

  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      label: "WhatsApp Connected",
      className: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    },
    disconnected: {
      icon: XCircle,
      label: "WhatsApp Disconnected",
      className: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    },
    connecting: {
      icon: Loader2,
      label: "Connecting...",
      className: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className} data-testid="badge-whatsapp-status">
      <Icon className={`h-3 w-3 mr-1 ${status === "connecting" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
