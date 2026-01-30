'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  DollarSign,
  Users,
  CalendarCheck,
} from "lucide-react";
import { appointments, patients, invoices, getTodaysAppointments } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Line, LineChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
const todaysAppointments = getTodaysAppointments();

const chartData = [
  { month: "January", revenue: 12340 },
  { month: "February", revenue: 15430 },
  { month: "March", revenue: 17890 },
  { month: "April", revenue: 20120 },
  { month: "May", revenue: 22450 },
  { month: "June", revenue: 25000 },
];
const appointmentChartData = [
  { date: "Mon", appointments: 12 },
  { date: "Tue", appointments: 15 },
  { date: "Wed", appointments: 18 },
  { date: "Thu", appointments: 14 },
  { date: "Fri", appointments: 20 },
  { date: "Sat", appointments: 8 },
  { date: "Sun", appointments: 5 },
];


export default function DashboardPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-4xl">${totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +15% from last month
            </div>
          </CardContent>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Patients</CardDescription>
            <CardTitle className="text-4xl">{patients.filter(p => p.status === 'Active').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +10 from last week
            </div>
          </CardContent>
           <div className="absolute right-4 top-4 text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Appointments</CardDescription>
            <CardTitle className="text-4xl">{todaysAppointments.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {appointments.filter(a => a.status === 'Completed').length} completed
            </div>
          </CardContent>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Activity</CardDescription>
            <CardTitle className="text-4xl">78%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Bed occupancy rate
            </div>
          </CardContent>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <Activity className="h-6 w-6" />
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              A list of appointments scheduled for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.patientName}</TableCell>
                      <TableCell>{app.doctorName}</TableCell>
                      <TableCell>{app.time}</TableCell>
                      <TableCell>{app.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No appointments for today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{
                revenue: {
                  label: "Revenue",
                  color: "blue",
                },
              }} className="h-[200px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Appointments This Week</CardTitle>
            <CardDescription>A summary of scheduled appointments over the past week.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--accent))",
                },
              }} className="h-[200px] w-full">
              <LineChart data={appointmentChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="appointments" stroke="var(--color-appointments)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
}
