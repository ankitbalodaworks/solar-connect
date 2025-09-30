import { Users, MessageSquare, FileText, Wrench } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
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
    </div>
  );
}
