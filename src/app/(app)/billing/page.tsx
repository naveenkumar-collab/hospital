import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { invoiceSchema } from './components/schema';
import { invoices } from '@/lib/data';

// Simulate a database read for tasks.
async function getInvoices() {
  return z.array(invoiceSchema).parse(invoices);
}

export default async function BillingPage() {
  const invoiceData = await getInvoices();

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
      <DataTable data={invoiceData} columns={columns} />
    </div>
  );
}
