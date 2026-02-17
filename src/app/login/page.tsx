'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.24 0-7.68-3.52-7.68-7.82s3.44-7.82 7.68-7.82c2.44 0 3.98 1.02 4.92 1.94l2.62-2.62C17.03 2.38 14.96 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.86 0 5.08-1 6.74-2.62 1.74-1.64 2.36-4.04 2.36-6.2v-3.28h-9.2z"
    />
  </svg>
);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New states for phone auth
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    
    try {
      // Ensure any old verifier is cleared before creating a new one.
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      const appVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        }
      );
      window.recaptchaVerifier = appVerifier;

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      toast({ title: 'OTP sent successfully!' });
    } catch (error: any) {
      console.error(error);
      let description = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        description = 'Phone number sign-in is not enabled. Please enable it in your Firebase console under Authentication > Sign-in method.';
      }
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      const staffRef = doc(firestore, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);

      toast({ title: 'Signed in successfully!' });

      if (staffSnap.exists()) {
        router.push(
          redirectUrl.startsWith('/patient') ? '/dashboard' : redirectUrl
        );
      } else {
        // Not a staff member, check if patient or create one
        const patientRef = doc(firestore, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);
        if (!patientSnap.exists()) {
          await setDoc(patientRef, {
            id: user.uid,
            firstName: 'New',
            lastName: 'User',
            email: user.email || '',
            dateOfBirth: '1990-01-01',
            gender: 'Other',
            contactNumber: user.phoneNumber || '',
            address: 'N/A',
            status: 'Active',
            avatar:
              user.photoURL || `https://picsum.photos/seed/${user.uid}/120/120`,
          });
        }
        router.push('/patient/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'Invalid OTP or an error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      const staffRef = doc(firestore, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);

      toast({ title: 'Signed in successfully!' });

      if (staffSnap.exists()) {
        router.push(
          redirectUrl.startsWith('/patient') ? '/dashboard' : redirectUrl
        );
      } else {
        // This case is unlikely if only staff use this page, but good for safety
        router.push(
          redirectUrl.startsWith('/patient') ? redirectUrl : '/patient/dashboard'
        );
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'Please check your email and password.',
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

      toast({ title: 'Signed in successfully!' });

      if (staffSnap.exists()) {
        router.push(
          redirectUrl.startsWith('/patient') ? '/dashboard' : redirectUrl
        );
      } else {
        // If a non-staff user signs in via Google here, create a patient record for them.
        const patientRef = doc(firestore, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);

        if (!patientSnap.exists()) {
          const [firstName, ...lastNameParts] =
            user.displayName?.split(' ') || ['', ''];
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
            avatar:
              user.photoURL || `https://picsum.photos/seed/${user.uid}/120/120`,
          });
        }
        router.push('/patient/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      let description = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        description =
          'This sign-in method is not enabled. Please enable it in your Firebase console under Authentication > Sign-in method.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign in with Google failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Staff Login</CardTitle>
          <CardDescription>
            Enter your credentials below to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleSignIn}>
              <CardContent className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
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
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Signing In...' : 'Sign in'}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
          <TabsContent value="phone">
            {!isOtpSent ? (
              <form onSubmit={handlePhoneSignIn}>
                <CardContent className="grid gap-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 555-555-5555"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </CardContent>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <CardContent className="grid gap-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
                  </Button>
                </CardContent>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="relative mb-4 mt-4">
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
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center gap-2">
          <div className="text-center text-sm">
            <Link href={`/?${searchParams.toString()}`} className="underline">
              Are you a patient? Go back.
            </Link>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have a staff account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
