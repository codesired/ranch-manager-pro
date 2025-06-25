import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const transactionFormSchema = insertTransactionSchema.extend({
  type: z.enum(["income", "expense"], { required_error: "Please select a transaction type" }),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.date({ required_error: "Date is required" }),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      category: "",
      description: "",
      amount: "",
      date: new Date(),
      notes: "",
      partnerId: 1, // Default to first partner
    },
  });

  const watchType = form.watch("type");

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      // Clean up data for database
      const cleanData = {
        ...data,
        notes: data.notes && data.notes !== "" ? data.notes : undefined,
      };
      return await apiRequest("/api/transactions", {
        method: "POST",
        body: JSON.stringify(cleanData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/summary"] });
      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    mutation.mutate(data);
  };

  const incomeCategories = [
    { value: "livestock_sales", label: "Livestock Sales" },
    { value: "milk_sales", label: "Milk Sales" },
    { value: "breeding_fees", label: "Breeding Fees" },
    { value: "equipment_sales", label: "Equipment Sales" },
    { value: "other_income", label: "Other Income" },
  ];

  const expenseCategories = [
    { value: "feed_supplies", label: "Feed & Supplies" },
    { value: "veterinary", label: "Veterinary" },
    { value: "equipment", label: "Equipment" },
    { value: "maintenance", label: "Maintenance" },
    { value: "labor", label: "Labor" },
    { value: "utilities", label: "Utilities" },
    { value: "insurance", label: "Insurance" },
    { value: "fuel", label: "Fuel" },
    { value: "other_expense", label: "Other Expense" },
  ];

  const categories = watchType === "income" ? incomeCategories : expenseCategories;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Cattle Sale - Buyer ABC Corp" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about this transaction..."
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
            className="bg-ranch-brown hover:bg-ranch-brown/80 text-white"
          >
            {mutation.isPending ? "Recording..." : "Record Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
