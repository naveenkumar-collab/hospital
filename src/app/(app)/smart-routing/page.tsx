'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { routeTaskAction } from './action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Share2, CornerDownLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Routing...' : 'Route Task'}
      <CornerDownLeft className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function SmartRoutingModule() {
  const initialState = { success: false, message: '' };
  const [state, formAction] = useFormState(routeTaskAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!state.success && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Smart Task Routing</CardTitle>
          <CardDescription>
            Enter a task or notification, and the AI will determine the correct department or worker to route it to.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="taskContent">Task / Notification Content</Label>
              <Textarea
                id="taskContent"
                name="taskContent"
                placeholder="e.g., 'Patient in room 302 needs a new IV drip.' or 'Dr. Smith's surgery has been rescheduled to 3 PM.'"
                className="min-h-[120px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.success && state.data && (
        <Card className="mt-6 animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Routing Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Recipient</Label>
              <p className="text-lg font-semibold">{state.data.recipient}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Reasoning</Label>
              <p className="text-sm">{state.data.reason}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Forward Notification
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
