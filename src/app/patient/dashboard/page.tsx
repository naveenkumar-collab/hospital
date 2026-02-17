'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import type { Appointment, Staff } from "@/lib/types";
import { format } from "date-fns";
import { CalendarCheck, FileText, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PatientDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, "appointments"),
            where("patientId", "==", user.uid),
            where("status", "==", "Scheduled"),
            limit(1)
          )
        : null,
    [firestore, user]
  );
  const { data: appointments } = useCollection<Appointment>(appointmentsQuery);
  const nextAppointment = appointments?.[0];

  const staffCollection = useMemoFirebase(() => firestore ? collection(firestore, 'staff') : null, [firestore]);
  const { data: staffData } = useCollection<Staff>(staffCollection);
  
  const doctor = staffData?.find(s => s.id === nextAppointment?.staffId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user?.displayName?.split(' ')[0] || 'Patient'}!</h1>
        <Button asChild>
          <Link href="/patient/appointments">Book Appointment</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointment
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment && doctor ? (
                <div>
                    <p className="text-2xl font-bold">{format(new Date(nextAppointment.appointmentDateTime), "PP")}</p>
                    <p className="text-xs text-muted-foreground">
                        at {format(new Date(nextAppointment.appointmentDateTime), "p")} with Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medical Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Records</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/patient/records" className="underline">View your records</Link>
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Doctor
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dr. Emily Carter</div>
             <p className="text-xs text-muted-foreground">
              Cardiology Department
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        {/* Placeholder for more dashboard content */}
      </div>
    </div>
  );
}
