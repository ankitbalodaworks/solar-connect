import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CampaignFormProps {
  totalCustomers: number;
  onSubmit: (data: any) => void;
}

export function CampaignForm({ totalCustomers, onSubmit }: CampaignFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [threshold, setThreshold] = useState("150");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, message, threshold: parseInt(threshold) });
    console.log("Campaign created:", { name, message, threshold });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Summer Solar Promotion 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-campaign-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-message">WhatsApp Message</Label>
            <Textarea
              id="campaign-message"
              placeholder="नमस्ते! Sunshine Power से। PM Surya Ghar योजना के तहत अपनी छत पर सोलर पैनल लगाएं..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              data-testid="input-campaign-message"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include both Hindi and English for better reach in Rajasthan
            </p>
          </div>

          <div className="space-y-3">
            <Label>Target Customers by Electricity Consumption</Label>
            <RadioGroup value={threshold} onValueChange={setThreshold}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="150" id="threshold-150" data-testid="radio-threshold-150" />
                <Label htmlFor="threshold-150" className="font-normal cursor-pointer">
                  ≥150 units/month (All customers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="200" id="threshold-200" data-testid="radio-threshold-200" />
                <Label htmlFor="threshold-200" className="font-normal cursor-pointer">
                  ≥200 units/month (High consumers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="300" id="threshold-300" data-testid="radio-threshold-300" />
                <Label htmlFor="threshold-300" className="font-normal cursor-pointer">
                  ≥300 units/month (Premium targets)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">Estimated Recipients: </span>
              <span data-testid="text-recipient-count">{totalCustomers} customers</span>
            </p>
          </div>

          <Button type="submit" className="w-full" data-testid="button-create-campaign">
            Create Campaign
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
