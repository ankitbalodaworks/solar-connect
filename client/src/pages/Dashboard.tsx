import { Users, MessageSquare, FileText, Wrench, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your WhatsApp lead management system
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
          title="Leads Generated"
          value={89}
          icon={FileText}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Service Requests"
          value={23}
          icon={Wrench}
          trend={{ value: -8, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
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
                Create New Campaign
              </Button>
            </Link>
            <Link href="/leads">
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-leads">
                <FileText className="h-4 w-4 mr-2" />
                View All Leads
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New lead captured</p>
                <p className="text-xs text-muted-foreground">Rajesh Kumar - 3kW system inquiry</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Campaign sent</p>
                <p className="text-xs text-muted-foreground">Summer Solar Promotion - 156 recipients</p>
                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Service request</p>
                <p className="text-xs text-muted-foreground">Priya Sharma - Panel cleaning</p>
                <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Summer Solar Promotion</span>
                <span className="text-sm text-muted-foreground">156 sent</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">68% delivery rate</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">PM Surya Ghar Awareness</span>
                <span className="text-sm text-muted-foreground">203 sent</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">85% delivery rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
