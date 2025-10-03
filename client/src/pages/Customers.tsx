import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerUpload } from "@/components/CustomerUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, Search, MoreVertical, Trash2, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Customers() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Fetch customers from API
  const { data: customers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const handleUpload = (data: any[]) => {
    const formattedCustomers = data.map((row: any, index) => ({
      id: String(index + 1),
      name: row.Name || row.name || '',
      phone: row['Phone number'] || row.phone || '',
      address: row.Address || row.address || '',
      electricityConsumption: parseInt(row['Electricity Consumption'] || row.electricityConsumption || '0'),
    }));
    // Note: This currently only affects local state
    // TODO: Implement POST /api/customers/bulk to persist uploaded customers
    console.log('Customers uploaded:', formattedCustomers.length);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement DELETE /api/customers/:id API call
    console.log('Customer deleted:', id);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === "all") return true;
    const threshold = parseInt(filter);
    return c.electricityConsumption >= threshold;
  });

  const getConsumptionBadge = (consumption: number) => {
    if (consumption >= 300) {
      return <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">≥300 units</Badge>;
    } else if (consumption >= 200) {
      return <Badge className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">≥200 units</Badge>;
    } else {
      return <Badge variant="secondary">≥150 units</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Customer Management</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage your customer database
        </p>
      </div>

      <CustomerUpload onUpload={handleUpload} />

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading customers...</p>
          </CardContent>
        </Card>
      ) : customers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48" data-testid="select-filter-consumption">
                      <SelectValue placeholder="Filter by consumption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All customers</SelectItem>
                      <SelectItem value="150">≥150 units</SelectItem>
                      <SelectItem value="200">≥200 units</SelectItem>
                      <SelectItem value="300">≥300 units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-export-customers">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0}
                        onCheckedChange={toggleAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No customers found with the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        data-testid={`row-customer-${customer.id}`}
                        className="cursor-pointer hover-elevate"
                        onClick={(e) => {
                          if (!(e.target as HTMLElement).closest('button, input')) {
                            setSelectedCustomer(customer);
                          }
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(customer.id)}
                            onCheckedChange={() => toggleSelection(customer.id)}
                            data-testid={`checkbox-customer-${customer.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                        <TableCell>{getConsumptionBadge(customer.electricityConsumption)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-menu-${customer.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => setSelectedCustomer(customer)}
                                data-testid={`button-view-${customer.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(customer.id)}
                                data-testid={`button-delete-${customer.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 1-{filteredCustomers.length} of {filteredCustomers.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous">
                  Previous
                </Button>
                <Button variant="default" size="sm" data-testid="button-page-1">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled data-testid="button-next">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && customers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No customers found. Upload an Excel file to add customers to your database.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-customer-details">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer ID</p>
                  <p className="font-mono text-sm">{selectedCustomer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Electricity Consumption</p>
                  {getConsumptionBadge(selectedCustomer.electricityConsumption)}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                    <p>{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p>{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Campaign Eligibility</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    This customer consumes <strong>{selectedCustomer.electricityConsumption} units</strong> of electricity monthly.
                  </p>
                  {selectedCustomer.electricityConsumption >= 300 ? (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Eligible for all PM Surya Ghar solar installation campaigns
                    </p>
                  ) : selectedCustomer.electricityConsumption >= 200 ? (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      ✓ Eligible for campaigns targeting ≥200 unit consumers
                    </p>
                  ) : (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      ✓ Eligible for campaigns targeting ≥150 unit consumers
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
