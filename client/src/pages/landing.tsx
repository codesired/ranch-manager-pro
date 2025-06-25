import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Users, DollarSign, Package, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Tractor className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-200">
              Ranch Manager Pro
            </h1>
          </div>
          <p className="text-xl text-green-700 dark:text-green-300 mb-8 max-w-2xl mx-auto">
            Comprehensive livestock and ranch management system for modern farming operations. 
            Track your animals, manage finances, control inventory, and collaborate with partners.
          </p>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign In to Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <Tractor className="h-5 w-5 mr-2" />
                Livestock Management
              </CardTitle>
              <CardDescription>
                Track animal health, breeding records, and location data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Individual animal tracking with tag IDs</li>
                <li>• Health status monitoring</li>
                <li>• Breeding and birth records</li>
                <li>• Location and pasture management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Tracking
              </CardTitle>
              <CardDescription>
                Monitor income, expenses, and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Transaction recording and categorization</li>
                <li>• Profit and loss analysis</li>
                <li>• Monthly revenue tracking</li>
                <li>• Receipt and document storage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <Package className="h-5 w-5 mr-2" />
                Inventory Control
              </CardTitle>
              <CardDescription>
                Manage feed, supplies, and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Stock level monitoring</li>
                <li>• Low inventory alerts</li>
                <li>• Supplier management</li>
                <li>• Expiration date tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <Users className="h-5 w-5 mr-2" />
                Partner Collaboration
              </CardTitle>
              <CardDescription>
                Work together with ranch partners and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Role-based access control</li>
                <li>• Activity tracking</li>
                <li>• Shared data management</li>
                <li>• Communication tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Generate insights and export data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Financial performance reports</li>
                <li>• Livestock health summaries</li>
                <li>• Inventory status reports</li>
                <li>• Data export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <Tractor className="h-5 w-5 mr-2" />
                Mobile-Friendly
              </CardTitle>
              <CardDescription>
                Access your data anywhere on the ranch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Responsive design for all devices</li>
                <li>• Field data entry capabilities</li>
                <li>• Offline support for critical functions</li>
                <li>• Quick action shortcuts</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-green-800 dark:text-green-200 mb-4">
            Ready to modernize your ranch management?
          </h2>
          <Button 
            size="lg" 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign In Now
          </Button>
        </div>
      </div>
    </div>
  );
}