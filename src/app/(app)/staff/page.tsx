'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import type { Staff, UIStaff } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffPage() {
  const firestore = useFirestore();
  const staffCollection = useMemoFirebase(() => firestore ? collection(firestore, 'staff') : null, [firestore]);
  const { data: staffData, isLoading } = useCollection<Staff>(staffCollection);

  const departmentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'departments') : null, [firestore]);
  const { data: departments } = useCollection(departmentsCollection);

  const mappedData: UIStaff[] = staffData?.map(s => ({
    ...s,
    name: `${s.firstName} ${s.lastName}`,
    department: departments?.find(d => d.id === s.departmentId)?.name || 'N/A'
  })) || [];

  if (isLoading) {
    return (
      <div>
         <div className="mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="items-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-40 mt-3" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </CardHeader>
                <CardContent className="text-center">
                   <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
       <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Browse and manage hospital staff profiles.
        </p>
      </div>
      <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mappedData.map((member) => (
          <Card key={member.id}>
            <CardHeader className="items-center">
              <Image
                alt={`${member.name} avatar`}
                className="mb-3 rounded-full"
                height="120"
                src={member.avatar || `https://picsum.photos/seed/${member.id}/120/120`}
                style={{
                  aspectRatio: "120/120",
                  objectFit: "cover",
                }}
                width="120"
                data-ai-hint="person face"
              />
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>{member.department} Department</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Schedule</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
