'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.24 0-7.68-3.52-7.68-7.82s3.44-7.82 7.68-7.82c2.44 0 3.98 1.02 4.92 1.94l2.62-2.62C17.03 2.38 14.96 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.86 0 5.08-1 6.74-2.62 1.74-1.64 2.36-4.04 2.36-6.2v-3.28h-9.2z"
    />
  </svg>
);

export default function PatientLoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleGoogleSignIn = useCallback(async () => {
    if (!auth || !firestore) {
      setErrorState("Firebase is not ready. Please try again in a moment.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setErrorState(null);
    const provider = new GoogleAuthProvider();
    const redirectUrl = searchParams.get('redirect') || '/patient/dashboard';

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const staffRef = doc(firestore, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);

      if (staffSnap.exists()) {
        toast({ title: "Signed in as Staff!", description: "Redirecting to staff dashboard." });
        router.push('/dashboard');
        return;
      }

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
      toast({ title: "Signed in successfully!" });
      router.push(redirectUrl);
    } catch (error: any) {
      setIsLoading(false);
      let description = "An unexpected error occurred.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "The sign-in window was closed before completing.";
        setErrorState(description);
        router.push('/'); // Go back to selection screen
        return;
      } else if (error.code === 'auth/operation-not-allowed') {
        description = "Google Sign-In is not enabled for this project.";
      } else if (error.message) {
        description = error.message;
      }
      setErrorState(description);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: description,
      });
    }
  }, [auth, firestore, router, searchParams, toast]);

  useEffect(() => {
    handleGoogleSignIn();
  }, [handleGoogleSignIn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Patient Sign-In</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Redirecting you to Google to sign in securely..."
              : "Please use the button below to sign in."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center flex-col gap-4">
            {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
            
            {!isLoading && (
              <Button variant="default" className="w-full" type="button" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
            )}

            {errorState && <p className="text-sm text-destructive">{errorState}</p>}

          </div>
        </CardContent>
         <CardFooter>
            <div className="text-center text-sm w-full">
                <Link href="/" className="underline text-muted-foreground">
                Are you a staff member?
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
