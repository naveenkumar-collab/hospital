'use client';

import React from 'react';
import {
  Card,
  CardContent,
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
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Appointment, Staff, UIAppointment } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientAppointmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, "appointments"),
            where("patientId", "==", user.uid)
          )
        : null,
    [firestore, user]
  );
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsQuery);

  const staffCollection = useMemoFirebase(() => firestore ? collection(firestore, 'staff') : null, [firestore]);
  const { data: staffData, isLoading: isLoadingStaff } = useCollection<Staff>(staffCollection);

  const mappedData: UIAppointment[] = appointments?.map(a => {
    const staff = staffData?.find(s => s.id === a.staffId);
    const apptDateTime = new Date(a.appointmentDateTime);
    return {
      ...a,
      patientName: '',
      doctorName: staff ? `Dr. ${staff.firstName} ${staff.lastName}` : 'Unknown',
      date: format(apptDateTime, 'yyyy-MM-dd'),
      time: format(apptDateTime, 'p'),
    };
  }) || [];
  
  const upcomingAppointments = mappedData.filter(a => new Date(a.date) >= new Date() && a.status === 'Scheduled');
  const pastAppointments = mappedData.filter(a => new Date(a.date) < new Date() || a.status !== 'Scheduled');

  const isLoading = isLoadingAppointments || isLoadingStaff;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <Button>Book New Appointment</Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                        <TableRow key={app.id}>
                            <TableCell>{app.doctorName}</TableCell>
                            <TableCell>{app.date}</TableCell>
                            <TableCell>{app.time}</TableCell>
                            <TableCell><Badge>{app.status}</Badge></TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Reschedule</Button>
                                <Button variant="destructive" size="sm" className="ml-2">Cancel</Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No upcoming appointments.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pastAppointments.length > 0 ? pastAppointments.map(app => (
                        <TableRow key={app.id}>
                            <TableCell>{app.doctorName}</TableCell>
                            <TableCell>{app.date}</TableCell>
                            <TableCell><Badge variant={app.status === 'Completed' ? 'secondary' : 'outline'}>{app.status}</Badge></TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No past appointments.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
