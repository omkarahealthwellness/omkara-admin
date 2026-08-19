"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your store and publishing status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats?.productsCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total items in catalog
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats?.categoriesCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Across {stats?.tagsCount || 0} tags
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GitHub Assets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Unlimited</div>
            <p className="text-xs text-muted-foreground">
              Zero cost CDN via jsDelivr
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Live Manifest</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">v42</div>
            <p className="text-xs text-primary/80">
              Published 2 hours ago
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Audit log of recent changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs">
                    AD
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Updated Product: Mixed Sprouts</p>
                    <p className="text-sm text-muted-foreground">Changed price from ₹49 to ₹59</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {i}h ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Connection to backend services.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500" />
                   <span className="text-sm font-medium">Firestore</span>
                 </div>
                 <span className="text-xs text-muted-foreground">Connected</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500" />
                   <span className="text-sm font-medium">Cloudflare KV</span>
                 </div>
                 <span className="text-xs text-muted-foreground">Connected</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500" />
                   <span className="text-sm font-medium">Authentication</span>
                 </div>
                 <span className="text-xs text-muted-foreground">Active (Admin)</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
