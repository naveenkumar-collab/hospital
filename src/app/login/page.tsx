'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
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


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const staffRef = doc(firestore, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);
      
      toast({ title: "Signed in successfully!" });

      if (staffSnap.exists()) {
        router.push(redirectUrl.startsWith('/patient') ? '/dashboard' : redirectUrl);
      } else {
        router.push(redirectUrl.startsWith('/patient') ? redirectUrl : '/patient/dashboard');
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Please check your email and password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const staffRef = doc(firestore, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);

      toast({ title: "Signed in successfully!" });
      
      if (staffSnap.exists()) {
        router.push(redirectUrl.startsWith('/patient') ? '/dashboard' : redirectUrl);
      } else {
        const patientRef = doc(firestore, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);

        if (!patientSnap.exists()) {
          const [firstName, ...lastNameParts] = user.displayName?.split(' ') || ['', ''];
          const lastName = lastNameParts.join(' ');
          
          await setDoc(patientRef, {
            id: user.uid,
            firstName: firstName || 'New',
            lastName: lastName || 'User',
            email: user.email,
            dateOfBirth: '1990-01-01',
            gender: 'Other',
            contactNumber: user.phoneNumber || 'N/A',
            address: 'N/A',
            status: 'Active',
            avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/120/120`,
          });
        }
        router.push(redirectUrl.startsWith('/patient') ? redirectUrl : '/patient/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      let description = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        description = "This sign-in method is not enabled. Please enable it in your Firebase console under Authentication > Sign-in method.";
      }
      toast({
        variant: "destructive",
        title: "Sign in with Google failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing In...' : 'Sign in'}
            </Button>
          </CardContent>
        </form>
         <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <CardContent>
           <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <div className="text-center text-sm w-full">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
