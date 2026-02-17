
import type { Patient, Staff, Appointment, Bill } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

export const patients: Patient[] = [
  { id: "MT001", firstName: "Alice", lastName: "Johnson", dateOfBirth: "1979-05-10", gender: "Female", status: "Recovered", email: "alice.j@email.com", contactNumber: "555-0101", address: "123 Maple St, Springfield, USA", bloodGroup: "A+", allergies: ["Peanuts"], medicalHistorySummary: "History of hypertension, well-controlled with medication." },
  { id: "MT002", firstName: "Bob", lastName: "Williams", dateOfBirth: "1962-08-15", gender: "Male", status: "Active", email: "bob.w@email.com", contactNumber: "555-0102", address: "456 Oak Ave, Springfield, USA", bloodGroup: "O-", allergies: [], medicalHistorySummary: "No significant medical history." },
  { id: "MT003", firstName: "Charlie", lastName: "Brown", dateOfBirth: "1990-01-20", gender: "Male", status: "Active", email: "charlie.b@email.com", contactNumber: "555-0103", address: "789 Pine Ln, Springfield, USA", bloodGroup: "B+", allergies: ["Pollen"], medicalHistorySummary: "Seasonal allergies and asthma." },
  { id: "MT004", firstName: "Diana", lastName: "Prince", dateOfBirth: "1995-06-25", gender: "Female", status: "Active", email: "diana.p@email.com", contactNumber: "555-0104", address: "101 Cherry Rd, Springfield, USA", bloodGroup: "AB+", allergies: ["Penicillin"], medicalHistorySummary: "Generally healthy." },
  { id: "MT005", firstName: "Ethan", lastName: "Hunt", dateOfBirth: "1973-12-01", gender: "Male", status: "Recovered", email: "ethan.h@email.com", contactNumber: "555-0105", address: "212 Birch Blvd, Springfield, USA", bloodGroup: "A-", allergies: [], medicalHistorySummary: "Previous knee surgery in 2018." },
  { id: "MT006", firstName: "Fiona", lastName: "Glenanne", dateOfBirth: "1986-11-18", gender: "Female", status: "Active", email: "fiona.g@email.com", contactNumber: "555-0106", address: "333 Elm Ct, Springfield, USA", bloodGroup: "O+", allergies: ["Shellfish"], medicalHistorySummary: "No chronic illnesses." },
];

export const staff: Staff[] = [
  { id: "ST01", name: "Dr. Emily Carter", role: "Surgeon", department: "Cardiology", avatar: PlaceHolderImages.find(img => img.id === 'staff-1')?.imageUrl || '' },
  { id: "ST02", name: "Dr. Ben Adams", role: "Doctor", department: "Pediatrics", avatar: PlaceHolderImages.find(img => img.id === 'staff-2')?.imageUrl || '' },
  { id: "ST03", name: "Nurse Olivia White", role: "Nurse", department: "General Ward", avatar: PlaceHolderImages.find(img => img.id === 'staff-3')?.imageUrl || '' },
  { id: "ST04", name: "Dr. Jessica Lee", role: "Doctor", department: "Neurology", avatar: PlaceHolderImages.find(img => img.id === 'staff-4')?.imageUrl || '' },
  { id: "ST05", name: "Mark Chen", role: "Admin", department: "Administration", avatar: PlaceHolderImages.find(img => img.id === 'staff-5')?.imageUrl || '' },
  { id: "ST06", name: "Nurse Sam Taylor", role: "Nurse", department: "Emergency", avatar: PlaceHolderImages.find(img => img.id === 'staff-6')?.imageUrl || '' },
];

const staticToday = "2024-05-27";

export const appointments: (Omit<Appointment, 'appointmentDateTime'> & { date: string; time: string;})[] = [
  { id: "AP001", patientId: "MT003", staffId: "ST01", date: staticToday, time: "10:00 AM", status: "Scheduled", departmentId: "Cardiology", reasonForVisit: "Follow-up" },
  { id: "AP002", patientId: "MT004", staffId: "ST02", date: staticToday, time: "11:30 AM", status: "Scheduled", departmentId: "Pediatrics", reasonForVisit: "Vaccination" },
  { id: "AP003", patientId: "MT001", staffId: "ST04", date: "2024-05-28", time: "02:00 PM", status: "Completed", departmentId: "Neurology", reasonForVisit: "Headache consultation" },
  { id: "AP004", patientId: "MT002", staffId: "ST01", date: "2024-05-29", time: "09:00 AM", status: "Scheduled", departmentId: "Cardiology", reasonForVisit: "Pre-op check" },
];

export const invoices: (Omit<Bill, 'billingDate' | 'totalAmount'> & { patientId: string; amount: number; date: string;})[] = [
  { id: "INV001", patientId: "MT001", amount: 250, date: "2024-05-10", status: "Paid" },
  { id: "INV002", patientId: "MT002", amount: 400, date: "2024-05-12", status: "Unpaid" },
  { id: "INV003", patientId: "MT003", amount: 150, date: "2024-04-22", status: "Paid" },
  { id: "INV004", patientId: "MT004", amount: 75, date: "2024-05-15", status: "Unpaid" },
  { id: "INV005", patientId: "MT005", amount: 800, date: "2024-03-30", status: "Paid" },
  { id: "INV006", patientId: "MT006", amount: 320, date: "2024-04-15", status: "Overdue" },
];

export const getTodaysAppointments = () => {
  const today = staticToday;
  return appointments.filter(app => app.date === today);
}
