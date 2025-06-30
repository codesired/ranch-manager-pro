import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@shared/schema";

export function PartnersStatus() {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/partners"],
  });

  const getActivityStatus = (date: string | Date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 2) return "online";
    if (diffInHours < 24) return "recent";
    return "offline";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "recent":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  const formatLastActive = (date: string | Date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Active now";
    } else if (diffInHours < 24) {
      return `Active ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Active ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partners Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {partners.slice(0, 4).map((partner: User) => (
            <div key={partner.id} className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-ranch-green rounded-full flex items-center justify-center text-ranch-beige font-semibold">
                  {partner.firstName?.[0] || partner.username?.[0]?.toUpperCase() || partner.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(getActivityStatus(partner.lastActiveAt || new Date()))}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {partner.firstName && partner.lastName 
                    ? `${partner.firstName} ${partner.lastName}`
                    : partner.username || partner.email || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatLastActive(partner.lastActiveAt || new Date())}
                </p>
              </div>
            </div>
          ))}

          {partners.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No partners found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}