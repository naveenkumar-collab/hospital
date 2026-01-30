import { z } from "zod"

export const invoiceSchema = z.object({
  id: z.string(),
  patientName: z.string(),
  amount: z.number(),
  date: z.string(),
  status: z.enum(["Paid", "Unpaid", "Overdue"]),
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
