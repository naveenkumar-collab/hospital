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
import { staff } from "@/lib/data";

export default function StaffPage() {
  return (
    <div>
       <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Browse and manage hospital staff profiles.
        </p>
      </div>
      <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader className="items-center">
              <Image
                alt={`${member.name} avatar`}
                className="mb-3 rounded-full"
                height="120"
                src={member.avatar}
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
