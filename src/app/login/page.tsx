"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) {
      toast({
          variant: "destructive",
          title: t('login.firebaseNotConfiguredTitle'),
          description: t('login.firebaseNotConfiguredDesc'),
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: t('login.successTitle'),
        description: t('login.successDesc'),
      });
      router.push("/dashboard");
    } catch (error: any) {
      const errorCode = error.code || 'auth/unknown-error';
      console.error(`Login Error (${errorCode}):`, error.message);
      toast({
        variant: "destructive",
        title: t('login.errorTitle'),
        description: t('login.errorDesc'),
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
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>
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
              {t('login.loginButton')}
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              {t('login.loginWithGoogle')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('login.noAccount')}{" "}
            <Link href="/signup" className="underline">
              {t('login.signUpLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
