import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Receipt, Package, FileText } from "lucide-react";
import { LivestockForm } from "@/components/forms/livestock-form";
import { TransactionForm } from "@/components/forms/transaction-form";
import { InventoryForm } from "@/components/forms/inventory-form";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const quickActions = [
    {
      id: "livestock",
      label: "Add New Livestock",
      icon: Plus,
      color: "ranch-green",
      component: LivestockForm
    },
    {
      id: "transaction",
      label: "Record Transaction",
      icon: Receipt,
      color: "ranch-brown",
      component: TransactionForm
    },
    {
      id: "inventory",
      label: "Update Inventory",
      icon: Package,
      color: "amber-600",
      component: InventoryForm
    },
    {
      id: "report",
      label: "Generate Report",
      icon: FileText,
      color: "blue-600",
      component: null
    }
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === "report") {
      toast({
        title: "Generate Report",
        description: "Report generation feature will be available soon",
      });
      return;
    }
    setActiveDialog(actionId);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { text: string; bg: string; hover: string; group: string }> = {
      "ranch-green": {
        text: "text-ranch-green",
        bg: "bg-ranch-green",
        hover: "hover:bg-ranch-green",
        group: "group-hover:text-white"
      },
      "ranch-brown": {
        text: "text-ranch-brown",
        bg: "bg-ranch-brown",
        hover: "hover:bg-ranch-brown",
        group: "group-hover:text-white"
      },
      "amber-600": {
        text: "text-amber-600",
        bg: "bg-amber-600",
        hover: "hover:bg-amber-600",
        group: "group-hover:text-white"
      },
      "blue-600": {
        text: "text-blue-600",
        bg: "bg-blue-600",
        hover: "hover:bg-blue-600",
        group: "group-hover:text-white"
      }
    };
    return colorMap[color] || colorMap["ranch-green"];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const colors = getColorClasses(action.color);
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`w-full justify-start p-3 h-auto ${colors.hover} hover:text-white transition-colors duration-200 group`}
                  onClick={() => handleActionClick(action.id)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${colors.text} ${colors.group}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs for each action */}
      {quickActions.map((action) => {
        const Component = action.component;
        if (!Component) return null;
        
        return (
          <Dialog
            key={action.id}
            open={activeDialog === action.id}
            onOpenChange={(open) => !open && closeDialog()}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{action.label}</DialogTitle>
              </DialogHeader>
              <Component onSuccess={closeDialog} />
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}
