import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function WelcomePage({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectParam = searchParams.redirect ? `?redirect=${searchParams.redirect}` : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to MediTrack</CardTitle>
          <CardDescription>Please select your login method to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Button asChild size="lg" className="h-12">
            <Link href={`/patient-login${redirectParam}`}>
              Patient Login
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12">
            <Link href={`/login${redirectParam}`}>
              Staff Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
