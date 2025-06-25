import { Menu, Calendar } from "lucide-react";

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
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ranch-green rounded-full flex items-center justify-center text-ranch-beige font-semibold">
              J
            </div>
            <span className="text-sm font-medium text-gray-700">John Smith</span>
          </div>
        </div>
      </div>
    </div>
  );
}
