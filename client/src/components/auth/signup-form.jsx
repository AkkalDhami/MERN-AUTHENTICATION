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
import { useState } from "react";
import { RegisterSchema } from "../../schemas/auth";
import { Loader } from "lucide-react";
export function SignupForm({ className, onsubmit, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
  });

  const [apiError, setApiError] = useState(null);

  const handleSignupSubmit = async (data) => {
    try {
      await onsubmit(data);
    } catch (err) {
      toast.error(err.message);
      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Card className="gap-0">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl sm:text-2xl font-semibold">
              Create your account
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleSignupSubmit)}
            aria-label="signup-form"
            className={cn("flex flex-col gap-6", className)}
            {...props}
          >
            <div className="flex flex-col gap-2"></div>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
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
                </div>
                <Input
                  id="password"
                  name="password"
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
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="text-red-500 text-sm">{apiError}</div>
              )}

              <Button
                size="lg"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-6 w-6 animate-spin" />
                    {"Signing up..."}
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </div>
            <div className="text-sm">
              Already have an account?{" "}
              <Link to={"/login"} className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
