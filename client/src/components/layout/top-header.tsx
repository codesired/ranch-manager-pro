import { Menu, Calendar, Tractor } from "lucide-react";
import { UserNav } from "./user-nav";

interface TopHeaderProps {
  title: string;
}

export function TopHeader({ title }: TopHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button className="lg:hidden mr-3 text-ranch-green">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 mr-4">
            <Tractor className="h-6 w-6 text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Ranch Manager Pro</span>
          </div>
          <div className="text-gray-400">|</div>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <UserNav />
        </div>
      </div>
    </div>
  );
}
