import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertLivestockSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const livestockFormSchema = insertLivestockSchema.extend({
  tagId: z.string().min(1, "Tag ID is required"),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender" }),
  weight: z.string().optional().transform(val => val === "" ? undefined : val),
  location: z.string().optional().transform(val => val === "" ? undefined : val),
  purchasePrice: z.string().optional().transform(val => val === "" ? undefined : val),
  notes: z.string().optional().transform(val => val === "" ? undefined : val),
  healthStatus: z.enum(["healthy", "monitoring", "sick"]).default("healthy"),
});

type LivestockFormData = z.infer<typeof livestockFormSchema>;

interface LivestockFormProps {
  onSuccess?: () => void;
}

export function LivestockForm({ onSuccess }: LivestockFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LivestockFormData>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      tagId: "",
      breed: "",
      gender: "female",
      weight: "",
      location: "",
      purchasePrice: "",
      notes: "",
      healthStatus: "healthy",
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LivestockFormData) => {
      // Clean up empty strings to avoid database validation errors
      const cleanData = {
        ...data,
        weight: data.weight && data.weight !== "" ? data.weight : undefined,
        purchasePrice: data.purchasePrice && data.purchasePrice !== "" ? data.purchasePrice : undefined,
        location: data.location && data.location !== "" ? data.location : undefined,
        notes: data.notes && data.notes !== "" ? data.notes : undefined,
      };
      const payload = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      };
      await apiRequest("POST", "/api/livestock", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livestock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/livestock/stats"] });
      toast({
        title: "Success",
        description: "Livestock added successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add livestock",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LivestockFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tagId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag ID *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., C-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Angus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pasture A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="healthStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
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
                  placeholder="Additional notes about this animal..."
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
            className="bg-ranch-green hover:bg-ranch-light-green text-ranch-beige"
          >
            {mutation.isPending ? "Adding..." : "Add Livestock"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
