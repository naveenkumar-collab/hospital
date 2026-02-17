'use client';

import { useEffect } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { PatientHeader } from '@/components/patient-header';
import { PatientSidebar } from '@/components/patient-sidebar';
import { useUser, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect(`/login?redirect=${pathname}`);
    } else if (!isUserLoading && user && firestore) {
      // This is the patient layout. If a staff member lands here, redirect them.
      const checkUserRole = async () => {
        const staffRef = doc(firestore, 'staff', user.uid);
        const staffSnap = await getDoc(staffRef);
        if (staffSnap.exists()) {
          redirect('/dashboard');
        }
      };
      checkUserRole();
    }
  }, [user, isUserLoading, pathname, firestore]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <PatientSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <PatientHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
