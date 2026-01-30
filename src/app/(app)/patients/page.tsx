import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { patientSchema } from './components/schema';
import { patients } from '@/lib/data';

// Simulate a database read for tasks.
async function getPatients() {
  return z.array(patientSchema).parse(patients);
}

export default async function PatientsPage() {
  const patientData = await getPatients();

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Records</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of all patients in the system.
          </p>
        </div>
      </div>
      <DataTable data={patientData} columns={columns} />
    </div>
  );
}
