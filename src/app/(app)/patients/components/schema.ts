import { z } from "zod"

export const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.enum(["Male", "Female", "Other"]),
  lastVisit: z.string(),
  status: z.enum(["Active", "Recovered", "Deceased"]),
})

export type PatientSchema = z.infer<typeof patientSchema>
