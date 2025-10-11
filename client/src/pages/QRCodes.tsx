import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import QRCodeLibrary from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Download, Copy, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QrCode as QrCodeType, InsertQrCode } from "@shared/schema";

export default function QRCodes() {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("Hi");
  const [phoneNumber, setPhoneNumber] = useState("917725920701");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState<string>("");

  const { data: qrCodes = [], isLoading } = useQuery<QrCodeType[]>({
    queryKey: ["/api/qr-codes"],
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create QR code. Please try again.",
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
    createMutation.mutate({
      campaignName: campaignName.trim(),
      message: message.trim() || "Hi",
      phoneNumber: phoneNumber.trim(),
    });
  };

  const getWhatsAppUrl = (phone: string, msg: string) => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const generateQrCode = async (phone: string, msg: string): Promise<string> => {
    const waUrl = getWhatsAppUrl(phone, msg);
    try {
      const dataUrl = await QRCodeLibrary.toDataURL(waUrl, {
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
    generateQrCode(phoneNumber, message).then(setCurrentQrCodeUrl);
  }, [phoneNumber, message]);

  const handleDownload = async (phone: string, msg: string, name: string) => {
    const dataUrl = await generateQrCode(phone, msg);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${name.replace(/\s+/g, "_")}_QR.png`;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">QR Code Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create custom WhatsApp QR codes for different campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create QR Code</CardTitle>
            <CardDescription>
              Generate a QR code that opens WhatsApp with a pre-filled message
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
                <Label htmlFor="message">Pre-filled Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter the message that will be pre-filled in WhatsApp"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="input-message"
                />
              </div>

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
                  value={getWhatsAppUrl(phoneNumber, message)}
                  className="text-xs"
                  data-testid="input-whatsapp-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleCopyUrl(getWhatsAppUrl(phoneNumber, message))}
                  data-testid="button-copy-url"
                >
                  {copiedUrl === getWhatsAppUrl(phoneNumber, message) ? (
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
                  <TableHead>Message</TableHead>
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
                    <TableCell className="max-w-xs truncate" data-testid={`text-message-${qrCode.id}`}>
                      {qrCode.message}
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
                          onClick={() => handleDownload(qrCode.phoneNumber, qrCode.message, qrCode.campaignName)}
                          data-testid={`button-download-${qrCode.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(getWhatsAppUrl(qrCode.phoneNumber, qrCode.message))}
                          data-testid={`button-copy-${qrCode.id}`}
                        >
                          {copiedUrl === getWhatsAppUrl(qrCode.phoneNumber, qrCode.message) ? (
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
