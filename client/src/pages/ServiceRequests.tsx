import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search, Eye, Edit, FileText, Clock, Settings, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockServiceRequests = [
  {
    id: "26838990",
    customerName: "अनिल पंडित",
    customerPhone: "+919876543212",
    customerVillage: "गांव: बाड़ी नया",
    issueType: "Other",
    urgency: "Low",
    assignedTo: "",
    status: "In Progress",
    createdAt: new Date("2025-09-28T10:30:00"),
  },
  {
    id: "13ac1284",
    customerName: "प्रिया शर्मा",
    customerPhone: "+919876543211",
    customerVillage: "गांव: मालवीय",
    issueType: "Service/Repair",
    urgency: "Medium",
    assignedTo: "",
    status: "Pending",
    createdAt: new Date("2025-09-29T14:15:00"),
  },
  {
    id: "a8875847",
    customerName: "राज कुमार",
    customerPhone: "+919876543210",
    customerVillage: "गांव: वैशाली",
    issueType: "Installation",
    urgency: "High",
    assignedTo: "अमित पंडित",
    status: "Pending",
    createdAt: new Date("2025-09-30T09:45:00"),
  },
];

export default function ServiceRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRequests = mockServiceRequests.filter(request => {
    const matchesSearch = 
      request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customerPhone.includes(searchQuery) ||
      request.customerVillage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesIssueType = issueTypeFilter === "all" || request.issueType === issueTypeFilter;
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesIssueType && matchesUrgency;
  });

  const totalRequests = mockServiceRequests.length;
  const pendingCount = mockServiceRequests.filter(r => r.status === "Pending").length;
  const inProgressCount = mockServiceRequests.filter(r => r.status === "In Progress").length;
  const completedCount = mockServiceRequests.filter(r => r.status === "Completed").length;

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, string> = {
      Low: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      Medium: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      High: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return (
      <Badge variant="outline" className={variants[urgency]}>
        {urgency}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
      "In Progress": "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      Completed: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
    };
    return (
      <Badge className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Service Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all incoming service requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-requests">{totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-pending">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Settings className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-in-progress">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-completed">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-issue-type">
                <SelectValue placeholder="All Issue..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issue Types</SelectItem>
                <SelectItem value="Installation">Installation</SelectItem>
                <SelectItem value="Service/Repair">Service/Repair</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-40" data-testid="select-urgency">
                <SelectValue placeholder="All Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">ID</TableHead>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No service requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} data-testid={`row-service-${request.id}`}>
                      <TableCell className="font-mono text-sm">{request.id}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.customerName}</div>
                          <div className="text-sm text-muted-foreground">{request.customerPhone}</div>
                          <div className="text-xs text-muted-foreground">{request.customerVillage}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={request.issueType === "Installation" ? "text-blue-600 dark:text-blue-400" : ""}>
                          {request.issueType}
                        </span>
                      </TableCell>
                      <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                      <TableCell>
                        {request.assignedTo ? (
                          <span className="flex items-center gap-1">
                            <span className="text-blue-600 dark:text-blue-400">👤</span>
                            {request.assignedTo}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" data-testid={`button-view-${request.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-${request.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1-{filteredRequests.length} of {filteredRequests.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <Button
                variant="default"
                size="sm"
                data-testid="button-page-1"
              >
                {currentPage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredRequests.length < 10}
                onClick={() => setCurrentPage(p => p + 1)}
                data-testid="button-next"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
