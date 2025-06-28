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
  birthDate: z.string().optional().transform(val => val === "" ? undefined : val),
  purchaseDate: z.string().optional().transform(val => val === "" ? undefined : val),
});

type LivestockFormData = z.infer<typeof livestockFormSchema>;

interface LivestockFormProps {
  onSuccess?: () => void;
  editData?: any;
  isEdit?: boolean;
}

export function LivestockForm({ onSuccess, editData, isEdit }: LivestockFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formatDateForInput = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const form = useForm<LivestockFormData>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      tagId: editData?.tagId || "",
      breed: editData?.breed || "",
      gender: editData?.gender || "female",
      weight: editData?.weight?.toString() || "",
      location: editData?.location || "",
      purchasePrice: editData?.purchasePrice?.toString() || "",
      notes: editData?.notes || "",
      healthStatus: editData?.healthStatus || "healthy",
      birthDate: formatDateForInput(editData?.birthDate) || "",
      purchaseDate: formatDateForInput(editData?.purchaseDate) || "",
      isActive: editData?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LivestockFormData) => {
      const payload = {
        ...data,
        weight: data.weight && data.weight !== "" ? data.weight : undefined,
        purchasePrice: data.purchasePrice && data.purchasePrice !== "" ? data.purchasePrice : undefined,
        location: data.location && data.location !== "" ? data.location : undefined,
        notes: data.notes && data.notes !== "" ? data.notes : undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      };
      
      if (isEdit && editData?.id) {
        await apiRequest("PUT", `/api/livestock/${editData.id}`, payload);
      } else {
        await apiRequest("POST", "/api/livestock", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livestock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/livestock/stats"] });
      toast({
        title: "Success",
        description: isEdit ? "Livestock updated successfully" : "Livestock added successfully",
      });
      if (!isEdit) form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isEdit ? "Failed to update livestock" : "Failed to add livestock",
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
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update Livestock" : "Add Livestock")}
        </Button>
      </form>
    </Form>
  );
}