import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { LivestockTable } from "@/components/dashboard/livestock-table";
import { PartnersStatus } from "@/components/dashboard/partners-status";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-ranch-cream">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden">
        <TopHeader title="Farm Dashboard" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          <OverviewCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LivestockTable />
            </div>
            
            <div className="space-y-6">
              <PartnersStatus />
              <QuickActions />
            </div>
          </div>
          
          <FinancialOverview />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
