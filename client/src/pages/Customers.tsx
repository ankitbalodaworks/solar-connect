import { useState } from "react";
import { CustomerUpload } from "@/components/CustomerUpload";
import { CustomerTable } from "@/components/CustomerTable";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const handleUpload = (data: any[]) => {
    const formattedCustomers = data.map((row: any, index) => ({
      id: String(index + 1),
      name: row.Name || row.name || '',
      phone: row['Phone number'] || row.phone || '',
      address: row.Address || row.address || '',
      electricityConsumption: parseInt(row['Electricity Consumption'] || row.electricityConsumption || '0'),
    }));
    setCustomers(formattedCustomers);
    console.log('Customers uploaded:', formattedCustomers.length);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    console.log('Customer deleted:', id);
  };

  const filteredCustomers = customers.filter(c => {
    if (filter === "all") return true;
    const threshold = parseInt(filter);
    return c.electricityConsumption >= threshold;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Customer Management</h1>
        <p className="text-muted-foreground">
          Upload and manage your customer database
        </p>
      </div>

      <CustomerUpload onUpload={handleUpload} />

      {customers.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
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
              <p className="text-sm text-muted-foreground">
                Showing {filteredCustomers.length} of {customers.length} customers
              </p>
            </div>
            <Button variant="outline" data-testid="button-export-customers">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          <CustomerTable customers={filteredCustomers} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
}
