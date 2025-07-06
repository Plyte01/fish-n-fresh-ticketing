// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Ticket, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PDFTestButton } from '@/components/admin/PDFTestButton';

// Define the type for our dashboard data
type DashboardData = {
  totalRevenue: number;
  totalTicketsSold: number;
  totalEvents: number;
  chartData: { name: string; total: number }[];
  recentSales: {
    id: string;
    email: string | null;
    amount: number;
    event: { name: string };
  }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/dashboard');
        const result = await response.json();
        if (response.ok) {
          setData(result);
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }
  
  if (!data) {
    return <div className="p-8">Could not load dashboard data.</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
      
      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">KES {data.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{data.totalTicketsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{data.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Past and upcoming events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Sales Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarFallback className="text-xs">{sale.email?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                </Avatar>
                <div className="ml-3 sm:ml-4 space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none truncate">{sale.event.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{sale.email}</p>
                </div>
                <div className="ml-auto font-medium text-sm sm:text-base">+KES {sale.amount.toLocaleString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* PDF Test Button - Temporary Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">PDF Generation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <PDFTestButton />
        </CardContent>
      </Card>
    </div>
  );
}