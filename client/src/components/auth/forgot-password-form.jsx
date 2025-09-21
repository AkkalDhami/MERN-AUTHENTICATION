import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { ForgotPasswordSchema } from "../../schemas/auth";
import { Loader } from "lucide-react";

export function ForgotPasswordForm({
  className,
  onsubmit,
  emailVerify = false,
  changePassword = false,
  ...props
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onTouched",
  });

  const [apiError, setApiError] = useState(null);

  const handleForgotFormSubmit = async (data) => {
    try {
      await onsubmit(data);
    } catch (err) {
      toast.error(err.message);
      setApiError("Something went wrong. Please try again.");
    }
  };

  const handleEmailVerify = async (data) => {
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
              {emailVerify ? "Email Verification" : "Forgot Password?"}
            </h2>
          </CardTitle>
          <CardDescription className="text-sm">
            {emailVerify
              ? " Enter your email and we'll send you otp to verify your email"
              : " Enter your email and we'll send you link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              emailVerify ? handleEmailVerify : handleForgotFormSubmit
            )}
            className={cn("flex flex-col gap-6", className)}
            {...props}>
            <div className="grid mt-2.5 gap-4">
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
                  <p className="text-red-500">{errors.email.message}</p>
                )}
              </div>

              {apiError && <p className="text-red-500">{apiError}</p>}

              <Button
                size="lg"
                type="submit"
                className="w-full"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-6 w-6 animate-spin" />
                    {"Sending..."}
                  </>
                ) : emailVerify ? (
                  "Send OTP"
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
            <div className="text-sm">
              {emailVerify ? (
                <>
                  Back to Profile ?{" "}
                  <Link
                    to={"/profile"}
                    className="underline underline-offset-4">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  Remember password ?{" "}
                  <Link to={"/login"} className="underline underline-offset-4">
                    Login
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
