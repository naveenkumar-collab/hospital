'use client';
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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { MedicalRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


export default function PatientRecordsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const recordsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, `patients/${user.uid}/medicalRecords`)
          )
        : null,
    [firestore, user]
    );

    const { data: records, isLoading } = useCollection<MedicalRecord>(recordsQuery);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Medical Records</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Record History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-60 w-full" /> : (
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
                                {records && records.length > 0 ? records.map(rec => (
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
