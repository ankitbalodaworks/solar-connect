import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Search, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface ContactStatus {
  customerPhone: string;
  latestEventType: string | null;
  latestEventTimestamp: string | null;
  formCount: number;
}

interface Form {
  id: string;
  customerPhone: string;
  formType: string;
  data: Record<string, any>;
  submittedAt: string;
}

export default function Status() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<"phone" | "event" | "timestamp" | "forms">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showFormsDialog, setShowFormsDialog] = useState(false);

  const { data: contacts, isLoading } = useQuery<ContactStatus[]>({
    queryKey: ["/api/contact-status"],
  });

  const { data: forms } = useQuery<Form[]>({
    queryKey: [`/api/contact-status/${selectedPhone}/forms`],
    enabled: !!selectedPhone && showFormsDialog,
  });

  const filteredContacts = (contacts || [])
    .filter((contact) => {
      const matchesSearch = contact.customerPhone.includes(searchTerm);
      const matchesFilter = eventFilter === "all" || contact.latestEventType === eventFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortColumn) {
        case "phone":
          aVal = a.customerPhone;
          bVal = b.customerPhone;
          break;
        case "event":
          aVal = a.latestEventType || "";
          bVal = b.latestEventType || "";
          break;
        case "timestamp":
          aVal = a.latestEventTimestamp ? new Date(a.latestEventTimestamp).getTime() : 0;
          bVal = b.latestEventTimestamp ? new Date(b.latestEventTimestamp).getTime() : 0;
          break;
        case "forms":
          aVal = a.formCount;
          bVal = b.formCount;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: typeof sortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    );
  };

  const handleExportCSV = () => {
    window.open("/api/contact-status/export/csv", "_blank");
  };

  const handleViewForms = (phone: string) => {
    setSelectedPhone(phone);
    setShowFormsDialog(true);
  };

  const eventTypes = Array.from(new Set((contacts || []).map(c => c.latestEventType).filter(Boolean))) as string[];

  const getEventBadgeVariant = (eventType: string | null) => {
    if (!eventType) return "outline";
    if (eventType === "form_submitted") return "default";
    if (eventType.startsWith("menu_")) return "secondary";
    if (eventType.startsWith("language_")) return "secondary";
    if (eventType === "delivered") return "outline";
    if (eventType === "read") return "outline";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contact Status</h1>
          <p className="text-muted-foreground">Track customer journey through WhatsApp conversations</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" data-testid="button-export-csv">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-event-filter">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover-elevate" onClick={() => handleSort("phone")} data-testid="header-phone">
                <div className="flex items-center">
                  Phone Number
                  {getSortIcon("phone")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover-elevate" onClick={() => handleSort("event")} data-testid="header-event">
                <div className="flex items-center">
                  Latest Event
                  {getSortIcon("event")}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="cursor-pointer hover-elevate" onClick={() => handleSort("forms")} data-testid="header-forms">
                <div className="flex items-center">
                  Forms
                  {getSortIcon("forms")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover-elevate" onClick={() => handleSort("timestamp")} data-testid="header-timestamp">
                <div className="flex items-center">
                  Last Activity
                  {getSortIcon("timestamp")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No contacts found</TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.customerPhone} data-testid={`row-contact-${contact.customerPhone}`}>
                  <TableCell className="font-medium" data-testid={`text-phone-${contact.customerPhone}`}>
                    {contact.customerPhone}
                  </TableCell>
                  <TableCell>
                    {contact.latestEventType ? (
                      <Badge variant={getEventBadgeVariant(contact.latestEventType)} data-testid={`badge-event-${contact.customerPhone}`}>
                        {contact.latestEventType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No events</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewForms(contact.customerPhone)}
                      disabled={contact.formCount === 0}
                      data-testid={`button-view-forms-${contact.customerPhone}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Forms
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-form-count-${contact.customerPhone}`}>
                      {contact.formCount}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-timestamp-${contact.customerPhone}`}>
                    {contact.latestEventTimestamp
                      ? format(new Date(contact.latestEventTimestamp), "MMM d, yyyy h:mm a")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showFormsDialog} onOpenChange={setShowFormsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Form Submissions - {selectedPhone}</DialogTitle>
            <DialogDescription>
              All form submissions from this contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {forms?.map((form) => (
              <div key={form.id} className="border rounded-md p-4 space-y-2" data-testid={`form-${form.id}`}>
                <div className="flex items-center justify-between">
                  <Badge>{form.formType}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(form.submittedAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(form.data).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}: </span>
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {forms?.length === 0 && (
              <p className="text-center text-muted-foreground">No forms submitted yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
