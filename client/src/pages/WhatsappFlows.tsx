import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Check, X, AlertCircle, Upload, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WhatsappFlow } from "@shared/schema";

// Flow status summary interface
interface FlowStatusSummary {
  total: number;
  published: number;
  draft: number;
  error: number;
  flows: WhatsappFlow[];
}

// Sync result interface
interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export default function WhatsappFlows() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Fetch flow status summary
  const { data: summary, isLoading, error, refetch } = useQuery<FlowStatusSummary>({
    queryKey: ["/api/whatsapp-flows/status/summary"],
  });

  // Sync flows mutation
  const syncFlowsMutation = useMutation<SyncResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/whatsapp-flows/sync");
      return await res.json();
    },
    onMutate: () => {
      setIsSyncing(true);
      setSyncResult(null);
    },
    onSuccess: (data: SyncResult) => {
      setSyncResult(data);
      if (data.success) {
        toast({
          title: "Flows synced successfully",
          description: `Created: ${data.created}, Updated: ${data.updated}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sync completed with errors",
          description: `Created: ${data.created}, Updated: ${data.updated}, Failed: ${data.failed}`,
        });
      }
      // Refetch the summary to update the UI
      refetch();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error.message || "Failed to sync flows with WhatsApp",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  // Publish flow mutation
  const publishFlowMutation = useMutation({
    mutationFn: async (flowKey: string) => {
      const res = await apiRequest("POST", `/api/whatsapp-flows/${flowKey}/publish`);
      return await res.json();
    },
    onSuccess: (data, flowKey) => {
      toast({
        title: "Flow published",
        description: `Flow ${flowKey} has been published successfully`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: error.message || "Failed to publish flow",
      });
    },
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800" data-testid={`badge-status-${status}`}>Published</Badge>;
      case "draft":
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Draft</Badge>;
      case "error":
        return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Error</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  // Get flow type display name
  const getFlowTypeDisplay = (flowType: string) => {
    const types: Record<string, string> = {
      survey: "Site Survey",
      callback: "Callback Request",
      trust: "Trust Building",
      eligibility: "Eligibility Check",
      price: "Price Estimate (Legacy)",
      service: "Service Request (Legacy)",
    };
    return types[flowType] || flowType;
  };

  // Get language display
  const getLanguageDisplay = (language: string) => {
    return language === "hi" ? "Hindi" : "English";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load WhatsApp flows. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Flow Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and sync WhatsApp flows with Meta Business API
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => syncFlowsMutation.mutate()}
            disabled={isSyncing}
            data-testid="button-sync-flows"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Sync All Flows
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flows</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-flows">{summary?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Configured flows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-published-flows">
              {summary?.published || 0}
            </div>
            <p className="text-xs text-muted-foreground">Live flows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-draft-flows">
              {summary?.draft || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need publishing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-error-flows">
              {summary?.error || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Result Alert */}
      {syncResult && (
        <Alert variant={syncResult.success ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sync {syncResult.success ? "Completed" : "Completed with Errors"}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Created: <span className="font-semibold">{syncResult.created}</span></div>
                <div>Updated: <span className="font-semibold">{syncResult.updated}</span></div>
                <div>Failed: <span className="font-semibold">{syncResult.failed}</span></div>
              </div>
              {syncResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-sm mb-1">Errors:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {syncResult.errors.map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Flows Table */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Flows</CardTitle>
          <CardDescription>
            All configured WhatsApp flows and their sync status with Meta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flow Type</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meta Flow ID</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.flows.map((flow) => (
                <TableRow key={flow.flowKey} data-testid={`row-flow-${flow.flowKey}`}>
                  <TableCell className="font-medium">
                    {getFlowTypeDisplay(flow.flowType)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-language-${flow.language}`}>
                      {getLanguageDisplay(flow.language)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(flow.status)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {flow.metaFlowId ? (
                      <span data-testid={`text-meta-id-${flow.flowKey}`}>{flow.metaFlowId}</span>
                    ) : (
                      <span className="text-muted-foreground">Not created</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-version-${flow.flowKey}`}>
                      v{flow.version}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {flow.lastSyncedAt ? (
                      new Date(flow.lastSyncedAt).toLocaleString()
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {flow.status === "draft" && flow.metaFlowId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => publishFlowMutation.mutate(flow.flowKey)}
                        disabled={publishFlowMutation.isPending}
                        data-testid={`button-publish-${flow.flowKey}`}
                      >
                        Publish
                      </Button>
                    )}
                    {flow.status === "error" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => syncFlowsMutation.mutate()}
                        disabled={isSyncing}
                        data-testid={`button-retry-${flow.flowKey}`}
                      >
                        Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!summary?.flows || summary.flows.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No flows configured yet.</p>
              <p className="text-sm mt-2">Click "Sync All Flows" to create flows in WhatsApp.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Flow Sync Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Automatic Flow Management:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Flows are automatically created in WhatsApp when you click "Sync All Flows"</li>
              <li>Flow JSONs are generated from the application's flow definitions</li>
              <li>Updates to flow JSONs are automatically pushed to WhatsApp</li>
              <li>Published flows become immediately available for use in conversations</li>
            </ul>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="font-medium">Flow States:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Draft:</strong> Flow created but not yet live</li>
              <li><strong>Published:</strong> Flow is live and can be used in conversations</li>
              <li><strong>Error:</strong> Flow creation or update failed - check error message</li>
            </ul>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Ensure WHATSAPP_ACCESS_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID environment variables 
              are configured correctly for flow sync to work.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}