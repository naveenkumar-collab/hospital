'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import type { Patient, UIPatient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function PatientsPage() {
  const firestore = useFirestore();
  const patientsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'patients') : null),
    [firestore]
  );
  const { data: patientData, isLoading } = useCollection<Patient>(
    patientsCollection
  );

  const [mappedData, setMappedData] = useState<UIPatient[]>([]);

  useEffect(() => {
    if (patientData) {
      setMappedData(
        patientData.map((p) => ({
          ...p,
          name: `${p.firstName} ${p.lastName}`,
          age: calculateAge(p.dateOfBirth),
        }))
      );
    }
  }, [patientData]);

  if (isLoading && mappedData.length === 0) {
    return (
      <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Patient Records
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of all patients in the system.
          </p>
        </div>
      </div>
      <DataTable data={mappedData} columns={columns} />
    </div>
  );
}
