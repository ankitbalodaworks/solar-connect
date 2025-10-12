import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import QRCodeLibrary from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode, Download, Copy, Check, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QrCode as QrCodeType, InsertQrCode, WhatsappFlow } from "@shared/schema";

export default function QRCodes() {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [qrType, setQrType] = useState<"message" | "flow">("message");
  const [message, setMessage] = useState("Hi");
  const [flowKey, setFlowKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("917725920701");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState<string>("");

  const { data: qrCodes = [], isLoading } = useQuery<QrCodeType[]>({
    queryKey: ["/api/qr-codes"],
  });

  const { data: availableFlows = [] } = useQuery<WhatsappFlow[]>({
    queryKey: ["/api/whatsapp-flows/available"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertQrCode) => {
      return await apiRequest("POST", "/api/qr-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      toast({
        title: "QR Code Created",
        description: "Your WhatsApp QR code has been generated successfully.",
      });
      setCampaignName("");
      setMessage("Hi");
      setFlowKey("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a campaign name.",
        variant: "destructive",
      });
      return;
    }

    if (qrType === "flow" && !flowKey) {
      toast({
        title: "Validation Error",
        description: "Please select a WhatsApp Flow.",
        variant: "destructive",
      });
      return;
    }

    if (qrType === "message" && !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    const data: InsertQrCode = {
      campaignName: campaignName.trim(),
      qrType,
      message: qrType === "message" ? message.trim() : undefined,
      flowKey: qrType === "flow" ? flowKey : undefined,
      phoneNumber: phoneNumber.trim(),
    };

    // Add metaFlowId for flow-type QR codes
    if (qrType === "flow" && flowKey) {
      const flow = availableFlows.find(f => f.flowKey === flowKey);
      if (flow?.metaFlowId) {
        data.metaFlowId = flow.metaFlowId;
      }
    }

    createMutation.mutate(data);
  };

  const getWhatsAppUrl = (qr: QrCodeType): string => {
    if (qr.qrType === "flow") {
      // Use stored metaFlowId if available, otherwise fallback to lookup
      const metaFlowId = qr.metaFlowId || availableFlows.find(f => f.flowKey === qr.flowKey)?.metaFlowId;
      if (metaFlowId) {
        return `https://wa.me/${qr.phoneNumber}?flow_id=${metaFlowId}`;
      }
    }
    return `https://wa.me/${qr.phoneNumber}?text=${encodeURIComponent(qr.message || "")}`;
  };

  const getCurrentWhatsAppUrl = (): string => {
    if (qrType === "flow" && flowKey) {
      const flow = availableFlows.find(f => f.flowKey === flowKey);
      if (flow?.metaFlowId) {
        return `https://wa.me/${phoneNumber}?flow_id=${flow.metaFlowId}`;
      }
    }
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const generateQrCode = async (url: string): Promise<string> => {
    try {
      const dataUrl = await QRCodeLibrary.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error("Error generating QR code:", err);
      return "";
    }
  };

  useEffect(() => {
    const url = getCurrentWhatsAppUrl();
    generateQrCode(url).then(setCurrentQrCodeUrl);
  }, [phoneNumber, message, qrType, flowKey, availableFlows]);

  const handleDownload = async (qr: QrCodeType) => {
    const url = getWhatsAppUrl(qr);
    const dataUrl = await generateQrCode(url);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${qr.campaignName.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "QR code image has been downloaded.",
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    
    toast({
      title: "Copied",
      description: "WhatsApp URL copied to clipboard.",
    });
  };

  const getFlowDisplayName = (flowKey: string): string => {
    const flow = availableFlows.find(f => f.flowKey === flowKey);
    return flow?.flowName || flowKey;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">QR Code Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create custom WhatsApp QR codes for messages or direct Flow access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create QR Code</CardTitle>
            <CardDescription>
              Generate a QR code that opens WhatsApp with a message or directly opens a Flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Summer Promo, Village Outreach"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  data-testid="input-campaign-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-type">QR Code Type *</Label>
                <Select value={qrType} onValueChange={(value: "message" | "flow") => setQrType(value)}>
                  <SelectTrigger id="qr-type" data-testid="select-qr-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message" data-testid="option-message">Message (Pre-filled text)</SelectItem>
                    <SelectItem value="flow" data-testid="option-flow">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        WhatsApp Flow (Direct form access)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {qrType === "message" 
                    ? "Opens WhatsApp with a pre-filled message" 
                    : "Directly opens a WhatsApp Flow form when scanned"}
                </p>
              </div>

              {qrType === "message" ? (
                <div className="space-y-2">
                  <Label htmlFor="message">Pre-filled Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter the message that will be pre-filled in WhatsApp"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    data-testid="input-message"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="flow-select">WhatsApp Flow *</Label>
                  <Select value={flowKey} onValueChange={setFlowKey}>
                    <SelectTrigger id="flow-select" data-testid="select-flow">
                      <SelectValue placeholder="Select a flow..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFlows.map((flow) => (
                        <SelectItem key={flow.flowKey} value={flow.flowKey} data-testid={`option-flow-${flow.flowKey}`}>
                          {flow.flowName} ({flow.language.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableFlows.length === 0 && (
                    <p className="text-xs text-orange-600">
                      No published flows available. Please sync flows in the WhatsApp Flows page.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp Business Phone</Label>
                <Input
                  id="phone"
                  placeholder="917725920701"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone"
                />
                <p className="text-xs text-muted-foreground">
                  Format: Country code + number (no +, spaces, or dashes)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="button-create-qr"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Creating..." : "Create QR Code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Scan this QR code to test your WhatsApp link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <img
                src={currentQrCodeUrl}
                alt="QR Code Preview"
                className="w-64 h-64"
                data-testid="img-qr-preview"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">WhatsApp URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getCurrentWhatsAppUrl()}
                  className="text-xs"
                  data-testid="input-whatsapp-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleCopyUrl(getCurrentWhatsAppUrl())}
                  data-testid="button-copy-url"
                >
                  {copiedUrl === getCurrentWhatsAppUrl() ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">QR Code Image URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={currentQrCodeUrl}
                  className="text-xs"
                  data-testid="input-qr-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleCopyUrl(currentQrCodeUrl)}
                  data-testid="button-copy-qr-url"
                >
                  {copiedUrl === currentQrCodeUrl ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved QR Codes</CardTitle>
          <CardDescription>
            All your generated QR codes with download and copy options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : qrCodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No QR codes yet. Create your first QR code above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id} data-testid={`row-qr-${qrCode.id}`}>
                    <TableCell className="font-medium" data-testid={`text-campaign-${qrCode.id}`}>
                      {qrCode.campaignName}
                    </TableCell>
                    <TableCell data-testid={`text-type-${qrCode.id}`}>
                      {qrCode.qrType === "flow" ? (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Flow
                        </Badge>
                      ) : (
                        <Badge variant="outline">Message</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" data-testid={`text-details-${qrCode.id}`}>
                      {qrCode.qrType === "flow" && qrCode.flowKey 
                        ? getFlowDisplayName(qrCode.flowKey)
                        : qrCode.message}
                    </TableCell>
                    <TableCell data-testid={`text-phone-${qrCode.id}`}>
                      {qrCode.phoneNumber}
                    </TableCell>
                    <TableCell data-testid={`text-date-${qrCode.id}`}>
                      {new Date(qrCode.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(qrCode)}
                          data-testid={`button-download-${qrCode.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(getWhatsAppUrl(qrCode))}
                          data-testid={`button-copy-${qrCode.id}`}
                        >
                          {copiedUrl === getWhatsAppUrl(qrCode) ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy URL
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
