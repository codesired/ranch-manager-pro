import { Link, useLocation } from "wouter";
import { Dog, BarChart3, DollarSign, Package, Users, FileText } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/livestock", icon: Dog, label: "Livestock" },
    { path: "/finances", icon: DollarSign, label: "Finances" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/partners", icon: Users, label: "Partners" },
    { path: "/reports", icon: FileText, label: "Reports" },
  ];

  return (
    <div className="w-64 bg-ranch-green text-white flex-shrink-0 hidden lg:block">
      <div className="p-6 border-b border-ranch-light-green">
        <h1 className="text-xl font-bold flex items-center">
          <Dog className="mr-3 text-ranch-beige" />
          Ranch Manager Pro
        </h1>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center px-6 py-3 text-ranch-beige hover:bg-ranch-light-green transition-colors duration-200 ${
                isActive ? "bg-ranch-light-green" : ""
              }`}>
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
