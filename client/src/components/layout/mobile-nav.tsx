import { Link, useLocation } from "wouter";
import { BarChart3, Dog, DollarSign, Package } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/livestock", icon: Dog, label: "Livestock" },
    { path: "/finances", icon: DollarSign, label: "Finances" },
    { path: "/inventory", icon: Package, label: "Inventory" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-ranch-green text-white z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center py-2 px-1 text-ranch-beige ${
                isActive ? "text-white" : ""
              }`}>
                <Icon className="text-lg h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
