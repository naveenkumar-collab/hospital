'use client';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { patients as mockPatients, staff as mockStaff, appointments as mockAppointments, invoices as mockInvoices } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function SeedPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSeed = async () => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Firestore not available" });
            return;
        }
        toast({ title: "Seeding database..." });

        try {
            // Seed patients
            for (const patient of mockPatients) {
                const { id, ...patientData } = patient;
                const patientRef = doc(firestore, 'patients', id);
                setDocumentNonBlocking(patientRef, patientData, { merge: true });
            }
            
            // Seed staff
            for (const staffMember of mockStaff) {
                 const { id, ...staffData } = staffMember;
                const nameParts = staffMember.name.replace('Dr. ', '').replace('Nurse ', '').split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ');

                const staffRef = doc(firestore, 'staff', id);
                setDocumentNonBlocking(staffRef, { 
                    ...staffData,
                    firstName,
                    lastName,
                    departmentId: "Cardiology" // Mock data for now
                }, { merge: true });
            }

            // Seed appointments
            for (const appointment of mockAppointments) {
                const { id, ...appointmentData } = appointment;
                const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`).toISOString();
                const appointmentRef = doc(firestore, 'appointments', id);
                const staffMember = mockStaff.find(s => s.id === appointment.staffId);
                setDocumentNonBlocking(appointmentRef, {
                    patientId: appointmentData.patientId,
                    staffId: appointmentData.staffId,
                    status: appointmentData.status,
                    appointmentDateTime,
                    departmentId: staffMember?.department || "General",
                    reasonForVisit: "Checkup"
                }, { merge: true });
            }

            // Seed bills (invoices)
            for (const invoice of mockInvoices) {
                const { id, patientId, amount, date, ...invoiceData } = invoice;
                const billRef = doc(firestore, 'patients', patientId, 'bills', id);
                setDocumentNonBlocking(billRef, {
                    ...invoiceData,
                    patientId: patientId,
                    totalAmount: amount,
                    billingDate: new Date(date).toISOString(),
                }, { merge: true });
            }

            toast({ title: "Seeding complete!", description: "Database has been seeded with mock data." });
        } catch (e: any) {
             toast({ variant: "destructive", title: "Seeding failed", description: e.message });
             console.error(e);
        }
    };

    return (
        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Seed Database</CardTitle>
              <CardDescription>
                Populate the Firestore database with the initial set of mock data. 
                This will overwrite any existing data with the same IDs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSeed}>Seed Data</Button>
            </CardContent>
          </Card>
        </div>
    )
}
