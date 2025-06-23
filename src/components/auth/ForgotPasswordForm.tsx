
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail } from 'lucide-react';

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: "If an account exists, you'll receive a password reset link shortly. Please also check your spam folder.",
      });
      setEmailSent(true);
    } catch (error: any) {
      let description = 'Could not send password reset email. Please try again.';
      if (error.code === 'auth/invalid-email') {
        description = 'The email address you entered is not valid.';
      }
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isClient) {
    return (
      <Card className="w-full max-w-md shadow-xl bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-full mx-auto mt-2" />
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-5 w-2/3 mx-auto mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl bg-card">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-headline">Forgot Your Password?</CardTitle>
        <CardDescription>
          {emailSent 
            ? "If an account exists for this email, you'll receive a password reset link shortly. Please also check your spam folder."
            : "Enter your email address and we'll send you a link to reset your password."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!emailSent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
        ) : (
           <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        )}
        {!emailSent && (
          <p className="mt-6 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
