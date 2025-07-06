"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Loader2 } from "lucide-react";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NexusCartLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) {
      toast({
          variant: "destructive",
          title: t('signup.firebaseNotConfiguredTitle'),
          description: t('signup.firebaseNotConfiguredDesc'),
      });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: t('signup.successTitle'),
        description: t('signup.successDesc'),
      });
      router.push("/login");
    } catch (error: any) {
      const errorCode = error.code || 'auth/unknown-error';
      const errorMessage = error.message || 'An unexpected error occurred.';
      console.error(`Signup Error (${errorCode}):`, errorMessage);
      let description = t('signup.errorDefault');
      if (errorCode === 'auth/email-already-in-use') {
        description = t('signup.errorEmailInUse');
      } else if (errorCode === 'auth/weak-password') {
        description = t('signup.errorWeakPassword');
      }
      toast({
        variant: "destructive",
        title: t('signup.errorTitle'),
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <NexusCartLogo className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
          <CardDescription>
            {t('signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">{t('signup.fullNameLabel')}</Label>
              <Input 
                id="full-name" 
                placeholder={t('signup.fullNamePlaceholder')}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
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
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <Input 
                id="password" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signup.createAccountButton')}
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              {t('signup.signUpWithGoogle')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('signup.haveAccount')}{" "}
            <Link href="/login" className="underline">
              {t('login.loginButton')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
