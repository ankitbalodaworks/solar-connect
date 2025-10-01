import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type MessageTemplate, type InsertMessageTemplate, insertMessageTemplateSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Filter, Upload, RefreshCw } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MessageTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFlowType, setFilterFlowType] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<MessageTemplate | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/message-templates"],
  });

  const form = useForm<InsertMessageTemplate>({
    resolver: zodResolver(insertMessageTemplateSchema),
    defaultValues: {
      name: "",
      flowType: "campaign",
      stepKey: "",
      messageType: "text",
      language: "en",
      bodyText: "",
      headerText: "",
      footerText: "",
      buttons: null,
      listSections: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMessageTemplate) => {
      return await apiRequest("POST", "/api/message-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-templates"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Template created",
        description: "Message template has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create message template.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertMessageTemplate }) => {
      return await apiRequest("PUT", `/api/message-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-templates"] });
      setDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
      toast({
        title: "Template updated",
        description: "Message template has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message template.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/message-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-templates"] });
      setDeleteTemplate(null);
      toast({
        title: "Template deleted",
        description: "Message template has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message template.",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/message-templates/${id}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-templates"] });
      toast({
        title: "Template submitted",
        description: "Template has been submitted to Meta for approval.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || String(error) || "Failed to submit template to Meta.";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const syncStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/message-templates/${id}/sync-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-templates"] });
      toast({
        title: "Status synced",
        description: "Template status has been updated from Meta.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || String(error) || "Failed to sync template status.";
      toast({
        title: "Sync failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template);
      form.reset({
        name: template.name,
        flowType: template.flowType,
        stepKey: template.stepKey,
        messageType: template.messageType,
        language: template.language,
        bodyText: template.bodyText,
        headerText: template.headerText ?? "",
        footerText: template.footerText ?? "",
        buttons: template.buttons as any,
        listSections: template.listSections as any,
      });
    } else {
      setEditingTemplate(null);
      form.reset({
        name: "",
        flowType: "campaign",
        stepKey: "",
        messageType: "text",
        language: "en",
        bodyText: "",
        headerText: "",
        footerText: "",
        buttons: null,
        listSections: null,
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertMessageTemplate) => {
    // Parse JSON strings to arrays if needed
    const processedData = { ...data };
    
    // Ensure buttons is either null or a valid array
    if (data.messageType !== "button") {
      processedData.buttons = null;
    } else if (typeof data.buttons === "string" && data.buttons.trim() !== "") {
      try {
        processedData.buttons = JSON.parse(data.buttons);
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Buttons field contains invalid JSON",
          variant: "destructive",
        });
        return;
      }
    } else if (!data.buttons) {
      processedData.buttons = null;
    }
    
    // Ensure listSections is either null or a valid array
    if (data.messageType !== "list") {
      processedData.listSections = null;
    } else if (typeof data.listSections === "string" && data.listSections.trim() !== "") {
      try {
        processedData.listSections = JSON.parse(data.listSections);
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "List Sections field contains invalid JSON",
          variant: "destructive",
        });
        return;
      }
    } else if (!data.listSections) {
      processedData.listSections = null;
    }
    
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: processedData });
    } else {
      createMutation.mutate(processedData);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.stepKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.bodyText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFlowType = filterFlowType === "all" || template.flowType === filterFlowType;
    const matchesLanguage = filterLanguage === "all" || template.language === filterLanguage;

    return matchesSearch && matchesFlowType && matchesLanguage;
  });

  const getFlowTypeBadge = (flowType: string) => {
    return (
      <Badge variant="default" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
        Campaign
      </Badge>
    );
  };

  const getMessageTypeBadge = (messageType: string) => {
    const types: Record<string, { label: string; color: string }> = {
      button: { label: "Button", color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
      list: { label: "List", color: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
      text: { label: "Text", color: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800" },
    };
    const type = types[messageType] || types.text;
    return <Badge className={type.color}>{type.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800" },
      pending: { label: "Pending", color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
      approved: { label: "Approved", color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
      rejected: { label: "Rejected", color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
    };
    const statusInfo = statuses[status] || statuses.draft;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const messageType = form.watch("messageType");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Message Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage WhatsApp message templates for automated conversation flows
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-template">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, step key, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterFlowType} onValueChange={setFilterFlowType}>
                <SelectTrigger className="w-48" data-testid="select-filter-flow-type">
                  <SelectValue placeholder="Filter by flow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All flow types</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-40" data-testid="select-filter-language">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredTemplates.length} of {templates.length} templates
          </p>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flow Type</TableHead>
                  <TableHead>Step Key</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Message Type</TableHead>
                  <TableHead>Meta Status</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {templates.length === 0
                        ? "No templates yet. Create your first template to get started."
                        : "No templates found with the selected filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow
                      key={template.id}
                      data-testid={`row-template-${template.id}`}
                    >
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getFlowTypeBadge(template.flowType)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{template.stepKey}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{getMessageTypeBadge(template.messageType)}</TableCell>
                      <TableCell>{getStatusBadge(template.metaStatus || "draft")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => submitMutation.mutate(template.id)}
                            disabled={
                              (submitMutation.isPending && submitMutation.variables === template.id) ||
                              (syncStatusMutation.isPending && syncStatusMutation.variables === template.id) ||
                              template.metaStatus === "approved" ||
                              template.metaStatus === "pending"
                            }
                            data-testid={`button-submit-${template.id}`}
                          >
                            <Upload className={`h-3 w-3 mr-1 ${(submitMutation.isPending && submitMutation.variables === template.id) ? 'animate-pulse' : ''}`} />
                            {(submitMutation.isPending && submitMutation.variables === template.id) ? "Submitting..." : "Submit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncStatusMutation.mutate(template.id)}
                            disabled={
                              (submitMutation.isPending && submitMutation.variables === template.id) ||
                              (syncStatusMutation.isPending && syncStatusMutation.variables === template.id)
                            }
                            data-testid={`button-sync-${template.id}`}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${(syncStatusMutation.isPending && syncStatusMutation.variables === template.id) ? 'animate-spin' : ''}`} />
                            {(syncStatusMutation.isPending && syncStatusMutation.variables === template.id) ? "Syncing..." : "Sync"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTemplate(template)}
                            disabled={
                              (submitMutation.isPending && submitMutation.variables === template.id) ||
                              (syncStatusMutation.isPending && syncStatusMutation.variables === template.id)
                            }
                            data-testid={`button-delete-${template.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-template-form">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Language Selection" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="flowType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-flow-type">
                            <SelectValue placeholder="Select flow type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="campaign">Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stepKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Key</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., language_select" data-testid="input-step-key" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Unique identifier for this step
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-message-type">
                            <SelectValue placeholder="Select message type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="button">Button</SelectItem>
                          <SelectItem value="list">List</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bodyText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Text</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter the main message content..."
                        rows={4}
                        data-testid="textarea-body-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="headerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Text (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="Optional header" data-testid="input-header-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Text (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="Optional footer" data-testid="input-footer-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {messageType === "button" && (
                <FormField
                  control={form.control}
                  name="buttons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buttons (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              field.onChange(parsed);
                            } catch {
                              field.onChange(e.target.value);
                            }
                          }}
                          placeholder='[{"id": "1", "title": "Yes", "nextStep": "offer"}]'
                          rows={4}
                          data-testid="textarea-buttons"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Array of button objects with id, title, and nextStep
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {messageType === "list" && (
                <FormField
                  control={form.control}
                  name="listSections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Sections (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              field.onChange(parsed);
                            } catch {
                              field.onChange(e.target.value);
                            }
                          }}
                          placeholder='[{"title": "Options", "rows": [{"id": "1", "title": "Option 1"}]}]'
                          rows={4}
                          data-testid="textarea-list-sections"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Array of list section objects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplate && deleteMutation.mutate(deleteTemplate.id)}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-delete-confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
