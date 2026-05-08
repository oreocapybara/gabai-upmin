"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/admin");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-4">
			<Image 
			src="/images/logo.svg" 
			alt="Gabai UP Mindanao" 
			width={167} 
			height={167}
			className="rounded-full"
			/>
        <h1 className="text-xl font-semibold text-content-brand font-montserrat">
          GABAI UP MINDANAO
        </h1>
      </div>

      {/* Login Form Card */}
      <Card className="border-0 shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-semibold">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:border-surface-brand focus:ring-surface-brand"
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:border-surface-brand focus:ring-surface-brand"
                />
              </div>

              {/* Help Text */}
              <p className="text-xs text-content-tertiary">This is a help text</p>

              {/* Error Message */}
              {error && <p className="text-sm text-content-negative">{error}</p>}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-surface-brand hover:bg-surface-brand-hover text-content-inverse-primary rounded-2xl font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In →"}
              </Button>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="default"
                className="w-full h-11 rounded-2xl"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                Sign in with Google
              </Button>

              {/* Footer Text */}
              <p className="text-center text-xs text-content-tertiary mt-4">
                Don't have an account? Admin access is managed by the System Administrator
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}