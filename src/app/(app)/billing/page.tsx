'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import type { Bill, Patient, UIInvoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function BillingPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const billsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'bills')) : null),
    [firestore]
  );
  const { data: billData, isLoading: isLoadingBills } = useCollection<Bill>(billsQuery);

  const patientsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'patients') : null), [firestore]);
  const { data: patientData, isLoading: isLoadingPatients } = useCollection<Patient>(patientsCollection);

  const mappedData: UIInvoice[] = billData?.map(b => {
    const patient = patientData?.find(p => p.id === b.patientId);
    return {
      ...b,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      amount: b.totalAmount,
      date: format(new Date(b.billingDate), 'yyyy-MM-dd'),
    };
  }) || [];

  const isLoading = isLoadingBills || isLoadingPatients;

  if (isLoading) {
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
    )
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing System</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of all invoices.
          </p>
        </div>
      </div>
      <DataTable data={mappedData} columns={columns} />
    </div>
  );
}
