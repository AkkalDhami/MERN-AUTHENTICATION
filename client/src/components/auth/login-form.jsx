import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { LoginSchema } from "../../schemas/auth";
import { useGoogleLoginMutation } from "../../features/auth/authApi";

export function LoginForm({ className, onsubmit, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const [googleLogin, { isError, error }] = useGoogleLoginMutation();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        console.log(authResult);
        const result = await googleLogin(authResult.code).unwrap();
        console.log("Login success:", result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    redirect_uri: "http://localhost:5173/auth/callback",
    flow: "auth-code",
  });

  const [apiError, setApiError] = useState(null);

  const handleLoginSubmit = async (data) => {
    try {
      await onsubmit(data);
    } catch (err) {
      toast.error(err.message);
      setApiError("Something went wrong. Please try again.");
    }
  };

  if (isError) toast.error(error?.data?.message);

  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl sm:text-2xl font-semibold">
            Login to your account
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Login form"
          onSubmit={handleSubmit(handleLoginSubmit)}
          className={cn("flex flex-col gap-6")}
          {...props}
        >
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password *</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            {apiError && <div className="text-red-500 text-sm">{apiError}</div>}
            <Button
              size="lg"
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-6 w-6 animate-spin" />
                  {"Logging in..."}
                </>
              ) : (
                "Login"
              )}
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>

            <Button
              onClick={googleLoginHandler}
              variant="outline"
              type="button"
              className="w-full"
            >
              <FaGoogle />
              Login with Google
            </Button>
          </div>
          <div className="text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
