'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.24 0-7.68-3.52-7.68-7.82s3.44-7.82 7.68-7.82c2.44 0 3.98 1.02 4.92 1.94l2.62-2.62C17.03 2.38 14.96 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.86 0 5.08-1 6.74-2.62 1.74-1.64 2.36-4.04 2.36-6.2v-3.28h-9.2z"
    />
  </svg>
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'patient' | 'staff'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (role === 'patient') {
        const patientRef = doc(firestore, 'patients', user.uid);
        await setDoc(patientRef, {
          id: user.uid,
          firstName,
          lastName,
          email,
          dateOfBirth: '1990-01-01', // Default value
          gender: 'Other', // Default value
          lastVisit: new Date().toISOString().split('T')[0],
          status: 'Active',
          avatar: `https://picsum.photos/seed/${user.uid}/120/120`,
        });
      } else {
        const staffRef = doc(firestore, 'staff', user.uid);
        await setDoc(staffRef, {
          id: user.uid,
          firstName,
          lastName,
          email,
          role: 'Doctor', // Default role for new staff
          departmentId: 'General', // Default department
          avatar: `https://picsum.photos/seed/${user.uid}/120/120`,
        });
      }
      
      toast({ title: "Account created successfully!" });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const patientRef = doc(firestore, 'patients', user.uid);
      const staffRef = doc(firestore, 'staff', user.uid);
      const patientSnap = await getDoc(patientRef);
      const staffSnap = await getDoc(staffRef);

      if (!patientSnap.exists() && !staffSnap.exists()) {
        const [firstName, ...lastNameParts] = user.displayName?.split(' ') || [];
        const lastName = lastNameParts.join(' ');
        
        await setDoc(patientRef, {
          id: user.uid,
          firstName: firstName || 'New',
          lastName: lastName || 'User',
          email: user.email,
          dateOfBirth: '1990-01-01',
          gender: 'Other',
          lastVisit: new Date().toISOString().split('T')[0],
          status: 'Active',
          avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/120/120`,
        });
      }
      
      toast({ title: "Account created successfully!" });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let description = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        description = "This sign-in method is not enabled. Please enable it in your Firebase console under Authentication > Sign-in method.";
      }
      toast({
        variant: "destructive",
        title: "Sign up with Google failed",
        description: description,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading || isGoogleLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading || isGoogleLoading} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">I am a...</Label>
              <Select onValueChange={(value: 'patient' | 'staff') => setRole(value)} defaultValue={role} disabled={isLoading || isGoogleLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="staff">Doctor / Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create account'}
              </Button>
          </CardContent>
        </form>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>
        <CardContent>
           <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter>
           <div className="w-full text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
