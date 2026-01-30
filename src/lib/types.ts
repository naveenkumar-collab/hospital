export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastVisit: string;
  status: "Active" | "Recovered" | "Deceased";
};

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type Staff = {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Admin" | "Surgeon";
  department: string;
  avatar: string;
};

export type Invoice = {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: "Paid" | "Unpaid" | "Overdue";
};
