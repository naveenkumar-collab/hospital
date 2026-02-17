'use client';

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Appointment, Patient, Staff, UIAppointment } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const firestore = useFirestore();

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const appointmentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'appointments') : null, [firestore]);
  const { data: appointmentData, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsCollection);

  const patientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'patients') : null, [firestore]);
  const { data: patientData, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  const staffCollection = useMemoFirebase(() => firestore ? collection(firestore, 'staff') : null, [firestore]);
  const { data: staffData, isLoading: isLoadingStaff } = useCollection<Staff>(staffCollection);

  const mappedData: UIAppointment[] = appointmentData?.map(a => {
    const patient = patientData?.find(p => p.id === a.patientId);
    const staff = staffData?.find(s => s.id === a.staffId);
    const apptDateTime = new Date(a.appointmentDateTime);
    return {
      ...a,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: staff ? `Dr. ${staff.firstName} ${staff.lastName}` : 'Unknown',
      date: format(apptDateTime, 'yyyy-MM-dd'),
      time: format(apptDateTime, 'p'),
    };
  }) || [];

  const isLoading = isLoadingAppointments || isLoadingPatients || isLoadingStaff;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              A list of all scheduled appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedData.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patientName}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Badge variant={appointment.status === 'Completed' ? 'secondary' : appointment.status === 'Cancelled' ? 'destructive' : 'default'}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem>Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>View the monthly appointment schedule.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
