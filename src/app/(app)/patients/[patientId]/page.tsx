'use client';

import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Patient, Appointment, MedicalRecord, Staff, UIAppointment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, Home, Mail, Droplet, ShieldAlert, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const firestore = useFirestore();

  // Fetch Patient Data
  const patientRef = useMemoFirebase(() => (firestore && patientId ? doc(firestore, 'patients', patientId) : null), [firestore, patientId]);
  const { data: patient, isLoading: isLoadingPatient } = useDoc<Patient>(patientRef);

  // Fetch Appointments
  const appointmentsQuery = useMemoFirebase(() => (firestore && patientId ? query(collection(firestore, 'appointments'), where('patientId', '==', patientId)) : null), [firestore, patientId]);
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsQuery);

  // Fetch Medical Records
  const medicalRecordsQuery = useMemoFirebase(() => (firestore && patientId ? collection(firestore, `patients/${patientId}/medicalRecords`) : null), [firestore, patientId]);
  const { data: medicalRecords, isLoading: isLoadingMedicalRecords } = useCollection<MedicalRecord>(medicalRecordsQuery);
  
  // Fetch Staff Data for doctor names
  const staffCollection = useMemoFirebase(() => firestore ? collection(firestore, 'staff') : null, [firestore]);
  const { data: staffData, isLoading: isLoadingStaff } = useCollection<Staff>(staffCollection);


  const isLoading = isLoadingPatient || isLoadingAppointments || isLoadingMedicalRecords || isLoadingStaff;

  const mappedAppointments: UIAppointment[] = appointments?.map(a => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center">Patient not found.</div>;
  }

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={patient.avatar} alt={`${patient.firstName} ${patient.lastName}`} />
            <AvatarFallback>{patient.firstName?.[0]}{patient.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{`${patient.firstName} ${patient.lastName}`}</CardTitle>
            <CardDescription>Patient ID: {patient.id}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{age} years old, {patient.gender}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{patient.contactNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center gap-3 col-span-1 lg:col-span-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span>{patient.address}</span>
            </div>
             <div className="flex items-center gap-3">
              <Droplet className="h-5 w-5 text-muted-foreground" />
              <span>Blood Group: <strong>{patient.bloodGroup || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-3 col-span-1 md:col-span-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              <span>Allergies: <strong>{patient.allergies?.join(', ') || 'None known'}</strong></span>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
               <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5" /> Medical History Summary</h4>
               <p className="text-muted-foreground bg-secondary p-3 rounded-md">{patient.medicalHistorySummary || 'No summary available.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-6 w-6" /> Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedAppointments.length > 0 ? mappedAppointments.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>{app.time}</TableCell>
                  <TableCell>{app.doctorName}</TableCell>
                  <TableCell>{app.reasonForVisit}</TableCell>
                  <TableCell><Badge variant={app.status === 'Completed' ? 'secondary' : app.status === 'Cancelled' ? 'destructive' : 'default'}>{app.status}</Badge></TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No appointments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /> Medical Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {medicalRecords && medicalRecords.length > 0 ? medicalRecords.map(rec => (
                <TableRow key={rec.id}>
                  <TableCell>{format(new Date(rec.recordDateTime), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{rec.diagnosis}</TableCell>
                  <TableCell>{rec.treatment}</TableCell>
                  <TableCell className="max-w-xs truncate">{rec.notes}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No medical records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
