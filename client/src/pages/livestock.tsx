import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dog, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LivestockForm } from "@/components/forms/livestock-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Livestock } from "@shared/schema";

export default function LivestockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Livestock | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: livestock = [], isLoading } = useQuery({
    queryKey: ["/api/livestock"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/livestock/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livestock"] });
      toast({
        title: "Success",
        description: "Livestock deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete livestock",
        variant: "destructive",
      });
    },
  });

  const filteredLivestock = livestock.filter((animal: Livestock) =>
    animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "monitoring":
        return "bg-yellow-100 text-yellow-800";
      case "sick":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-ranch-cream">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Dog className="h-12 w-12 mx-auto mb-4 text-ranch-green animate-pulse" />
            <p className="text-lg text-gray-600">Loading livestock...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-ranch-cream">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden">
        <TopHeader title="Livestock Management" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Dog className="h-6 w-6 text-ranch-green" />
                  Livestock Inventory ({filteredLivestock.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by tag, breed, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-ranch-green hover:bg-ranch-light-green text-ranch-beige">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Livestock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Livestock</DialogTitle>
                      </DialogHeader>
                      <LivestockForm onSuccess={() => setIsFormOpen(false)} />
                    </DialogContent>
                  </Dialog>
                  
                  {/* Edit Dialog */}
                  <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Livestock - {editingAnimal?.tagId}</DialogTitle>
                      </DialogHeader>
                      <LivestockForm 
                        editData={editingAnimal} 
                        isEdit={true}
                        onSuccess={() => {
                          setIsEditFormOpen(false);
                          setEditingAnimal(null);
                        }} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLivestock.map((animal: Livestock) => (
                  <Card key={animal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{animal.tagId}</h3>
                          <p className="text-gray-600">{animal.breed}</p>
                        </div>
                        <Badge className={getHealthStatusColor(animal.healthStatus || "unknown")}>
                          {animal.healthStatus || "Unknown"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gender:</span>
                          <span className="capitalize">{animal.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight:</span>
                          <span>{animal.weight ? `${animal.weight} lbs` : "Not recorded"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span>{animal.location || "Not assigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span>
                            {animal.birthDate
                              ? (() => {
                                  const birthDate = new Date(animal.birthDate);
                                  const now = new Date();
                                  const diffTime = now.getTime() - birthDate.getTime();
                                  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
                                  
                                  if (diffDays < 30) {
                                    return `${diffDays} days`;
                                  } else if (diffDays < 365) {
                                    const months = Math.floor(diffDays / 30);
                                    return `${months} month${months !== 1 ? 's' : ''}`;
                                  } else {
                                    const years = Math.floor(diffDays / 365);
                                    const remainingMonths = Math.floor((diffDays % 365) / 30);
                                    return remainingMonths > 0 
                                      ? `${years}y ${remainingMonths}m`
                                      : `${years} year${years !== 1 ? 's' : ''}`;
                                  }
                                })()
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingAnimal(animal);
                            setIsEditFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(animal.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredLivestock.length === 0 && (
                <div className="text-center py-12">
                  <Dog className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">No livestock found</p>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first animal"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
