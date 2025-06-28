import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Livestock } from "@shared/schema";

export function LivestockTable() {
  const { data: livestock = [], isLoading } = useQuery({
    queryKey: ["/api/livestock"],
  });

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

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return "Unknown";
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = now.getTime() - birth.getTime();
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
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Livestock Activity</CardTitle>
          <Link href="/livestock">
            <a className="text-ranch-green hover:text-ranch-light-green text-sm font-medium">
              View All
            </a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">Breed</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Health</th>
                <th className="pb-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {livestock.slice(0, 3).map((animal: Livestock) => (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {animal.tagId}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{animal.breed}</td>
                  <td className="py-3 text-sm text-gray-600">
                    {calculateAge(animal.birthDate)}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {animal.weight ? `${animal.weight} lbs` : "N/A"}
                  </td>
                  <td className="py-3">
                    <Badge className={getHealthStatusColor(animal.healthStatus || "unknown")}>
                      {animal.healthStatus || "Unknown"}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {animal.location || "Not assigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {livestock.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No livestock data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
