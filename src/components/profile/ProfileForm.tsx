
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/schemas/profileSchemas';
import type { UserProfile } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Mail, User } from 'lucide-react';
import { db, doc, updateDoc } from '@/lib/firebase';

interface ProfileFormProps {
  currentUser: UserProfile;
}

const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
  if (parts.length > 1 && parts[0].length > 0 && parts[parts.length -1].length > 0) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length > 0) return parts[0][0].toUpperCase();
  return '?';
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const { toast } = useToast();
  const { refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const userInitials = getInitials(currentUser.name);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name || '',
      contactNumber: currentUser.contactNumber || '',
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: data.name,
        contactNumber: data.contactNumber || '',
        // 'otherDetails' is no longer updated from this form
      });
      
      await refreshUserProfile(); 

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully updated.',
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            {/* <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.name || 'User'} /> */}
            <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl">{currentUser.name || 'Your Profile'}</CardTitle>
            {currentUser.email && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Mail className="mr-2 h-4 w-4" />
                {currentUser.email}
              </div>
            )}
          </div>
        </div>
        <CardDescription>Keep your personal information up to date. Email is not editable here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* "Other Details" field removed */}
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
