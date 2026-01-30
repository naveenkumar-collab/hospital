'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Line, LineChart, ResponsiveContainer } from "recharts";

const patientDemographicsData = [
  { group: "0-18", value: 83 },
  { group: "19-45", value: 212 },
  { group: "46-65", value: 175 },
  { group: "65+", value: 98 },
];

const departmentActivityData = [
  { name: "Cardiology", appointments: 120, color: "hsl(var(--chart-1))" },
  { name: "Pediatrics", appointments: 95, color: "hsl(var(--chart-2))" },
  { name: "Neurology", appointments: 78, color: "hsl(var(--chart-3))" },
  { name: "Orthopedics", appointments: 110, color: "hsl(var(--chart-4))" },
  { name: "General", appointments: 250, color: "hsl(var(--chart-5))" },
];

const financialPerformanceData = [
  { month: "Jan", revenue: 40000, expenses: 24000 },
  { month: "Feb", revenue: 30000, expenses: 13980 },
  { month: "Mar", revenue: 20000, expenses: 9800 },
  { month: "Apr", revenue: 27800, expenses: 39080 },
  { month: "May", revenue: 18900, expenses: 48000 },
  { month: "Jun", revenue: 23900, expenses: 38000 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hospital Reports</h2>
        <p className="text-muted-foreground">
          Comprehensive overview of hospital operations and performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Department Activity</CardTitle>
            <CardDescription>Appointments per department for the last quarter.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentActivityData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" />
                  <XAxis dataKey="name" type="category" scale="band" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="appointments" radius={5}>
                    {departmentActivityData.map(entry => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Distribution of patients by age group.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={patientDemographicsData}
                    dataKey="value"
                    nameKey="group"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {patientDemographicsData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Performance</CardTitle>
          <CardDescription>Monthly revenue and expenses overview.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "hsl(var(--primary))" },
              expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
            }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialPerformanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
