import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertInventorySchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const inventoryFormSchema = insertInventorySchema.extend({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  minStockLevel: z.string().optional(),
  costPerUnit: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  onSuccess?: () => void;
}

export function InventoryForm({ onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: "",
      unit: "",
      minStockLevel: "",
      costPerUnit: "",
      supplier: "",
      location: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      // Clean up data for database
      const cleanData = {
        ...data,
        location: data.location && data.location !== "" ? data.location : undefined,
        notes: data.notes && data.notes !== "" ? data.notes : undefined,
        minStockLevel: data.minStockLevel && data.minStockLevel !== "" ? data.minStockLevel : undefined,
        costPerUnit: data.costPerUnit && data.costPerUnit !== "" ? data.costPerUnit : undefined,
        supplier: data.supplier && data.supplier !== "" ? data.supplier : undefined,
      };
      const payload = {
        ...data,
        lastRestocked: data.lastRestocked ? new Date(data.lastRestocked) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      };
      await apiRequest("POST", "/api/inventory", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    mutation.mutate(data);
  };

  const categories = [
    { value: "feed", label: "Feed" },
    { value: "medicine", label: "Medicine" },
    { value: "equipment", label: "Equipment" },
    { value: "supplies", label: "Supplies" },
    { value: "tools", label: "Tools" },
    { value: "other", label: "Other" },
  ];

  const units = [
    { value: "tons", label: "Tons" },
    { value: "lbs", label: "Pounds" },
    { value: "kg", label: "Kilograms" },
    { value: "bales", label: "Bales" },
    { value: "bags", label: "Bags" },
    { value: "bottles", label: "Bottles" },
    { value: "gallons", label: "Gallons" },
    { value: "liters", label: "Liters" },
    { value: "pieces", label: "Pieces" },
    { value: "boxes", label: "Boxes" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Cattle Feed Premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costPerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Per Unit ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="25.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ranch Supply Co" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Storage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastRestocked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Restocked</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about this item..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {mutation.isPending ? "Adding..." : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
