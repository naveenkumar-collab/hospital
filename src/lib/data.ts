
import type { Patient, Staff, Appointment, Invoice } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

export const patients: Patient[] = [
  { id: "MT001", name: "Alice Johnson", age: 45, gender: "Female", lastVisit: "2024-05-10", status: "Recovered" },
  { id: "MT002", name: "Bob Williams", age: 62, gender: "Male", lastVisit: "2024-05-12", status: "Active" },
  { id: "MT003", name: "Charlie Brown", age: 34, gender: "Male", lastVisit: "2024-04-22", status: "Active" },
  { id: "MT004", name: "Diana Prince", age: 29, gender: "Female", lastVisit: "2024-05-15", status: "Active" },
  { id: "MT005", name: "Ethan Hunt", age: 51, gender: "Male", lastVisit: "2024-03-30", status: "Recovered" },
  { id: "MT006", name: "Fiona Glenanne", age: 38, gender: "Female", lastVisit: "2024-05-01", status: "Active" },
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

export const appointments: Appointment[] = [
  { id: "AP001", patientName: "Charlie Brown", doctorName: "Dr. Emily Carter", date: staticToday, time: "10:00 AM", status: "Scheduled" },
  { id: "AP002", patientName: "Diana Prince", doctorName: "Dr. Ben Adams", date: staticToday, time: "11:30 AM", status: "Scheduled" },
  { id: "AP003", patientName: "Alice Johnson", doctorName: "Dr. Jessica Lee", date: "2024-05-28", time: "02:00 PM", status: "Completed" },
  { id: "AP004", patientName: "Bob Williams", doctorName: "Dr. Emily Carter", date: "2024-05-29", time: "09:00 AM", status: "Scheduled" },
];

export const invoices: Invoice[] = [
  { id: "INV001", patientName: "Alice Johnson", amount: 250, date: "2024-05-10", status: "Paid" },
  { id: "INV002", patientName: "Bob Williams", amount: 400, date: "2024-05-12", status: "Unpaid" },
  { id: "INV003", patientName: "Charlie Brown", amount: 150, date: "2024-04-22", status: "Paid" },
  { id: "INV004", patientName: "Diana Prince", amount: 75, date: "2024-05-15", status: "Unpaid" },
  { id: "INV005", patientName: "Ethan Hunt", amount: 800, date: "2024-03-30", status: "Paid" },
  { id: "INV006", patientName: "Fiona Glenanne", amount: 320, date: "2024-04-15", status: "Overdue" },
];

export const getTodaysAppointments = () => {
  const today = staticToday;
  return appointments.filter(app => app.date === today);
}
