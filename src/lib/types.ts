export type Patient = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  lastVisit: string;
  status: "Active" | "Recovered" | "Deceased";
};

export type Appointment = {
  id: string;
  patientId: string;
  staffId: string;
  appointmentDateTime: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  reasonForVisit: string;
  departmentId: string;
};

export type Staff = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Doctor" | "Nurse" | "Admin" | "Surgeon";
  departmentId: string;
  avatar: string;
};

export type Bill = {
  id: string;
  patientId: string;
  totalAmount: number;
  billingDate: string;
  status: "Paid" | "Unpaid" | "Overdue" | "Pending" | "Partially Paid";
};


// Composite types for UI display
export type UIPatient = Patient & {
  name: string;
  age: number;
}

export type UIAppointment = {
  id:string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export type UIStaff = Staff & {
  name: string;
  department: string;
}

export type UIInvoice = Bill & {
  patientName: string;
  amount: number;
  date: string;
}
