// src/components/admin/ScanDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ScanStats {
  today: {
    totalScans: number;
    successfulScans: number;
    duplicateAttempts: number;
    invalidTickets: number;
    attendanceRate: number;
  };
  recentActivity: Array<{
    id: number;
    status: string;
    timestamp: string;
    ticketCode?: string;
    eventName?: string;
    adminName: string;
    notes?: string;
  }>;
  eventsToday: Array<{
    id: string;
    name: string;
    venue: string;
    totalTickets: number;
    checkedInCount: number;
    startDate: string;
  }>;
  hourlyBreakdown: Array<{
    hour: number;
    scans: number;
    label: string;
  }>;
}

export function ScanDashboard() {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/scan/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch scan stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "text-blue-600",
    trend,
    subtitle 
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    trend?: number;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end">
            <Icon className={`h-8 w-8 ${color}`} />
            {trend !== undefined && (
              <div className={`flex items-center mt-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  const pieData = [
    { name: 'Successful', value: stats.today.successfulScans, color: COLORS[0] },
    { name: 'Duplicates', value: stats.today.duplicateAttempts, color: COLORS[1] },
    { name: 'Invalid', value: stats.today.invalidTickets, color: COLORS[2] },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scan Analytics</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Scans Today" 
          value={stats.today.totalScans} 
          icon={Scan}
          color="text-blue-600"
          subtitle="All scan attempts"
        />
        <StatCard 
          title="Successful Check-ins" 
          value={stats.today.successfulScans} 
          icon={CheckCircle2}
          color="text-green-600"
          subtitle="Valid tickets processed"
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${stats.today.attendanceRate}%`} 
          icon={Users}
          color="text-purple-600"
          subtitle="Checked in vs. total tickets"
        />
        <StatCard 
          title="Active Events" 
          value={stats.eventsToday.length} 
          icon={Calendar}
          color="text-orange-600"
          subtitle="Events with activity today"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Scan Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyBreakdown.filter(h => h.scans > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Status */}
      {stats.eventsToday.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.eventsToday.map((event) => {
                const attendancePercentage = event.totalTickets > 0 
                  ? Math.round((event.checkedInCount / event.totalTickets) * 100)
                  : 0;
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">
                          {event.checkedInCount} / {event.totalTickets} checked in
                        </span>
                        <Progress value={attendancePercentage} className="w-24" />
                        <span className="text-sm font-medium">{attendancePercentage}%</span>
                      </div>
                    </div>
                    <Badge variant={attendancePercentage > 80 ? "default" : attendancePercentage > 50 ? "secondary" : "outline"}>
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Scanning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {activity.status === 'ALREADY_CHECKED_IN' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {activity.status === 'INVALID_TICKET' && <XCircle className="h-4 w-4 text-red-600" />}
                    <div>
                      <p className="text-sm font-medium">{activity.eventName || 'Unknown Event'}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {activity.ticketCode} • {activity.adminName}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
