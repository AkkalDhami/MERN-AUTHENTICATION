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
import { Loader } from "lucide-react";
import { emailSchema } from "../../schemas/auth";

export function AuthEmailForm({
  className,
  schema = emailSchema,
  title = "Forgot Password?",
  description = "Enter your email and we'll send you a reset link.",
  buttonText = "Send Reset Link",
  linkText = "Remember password?",
  linkUrl = "/login",
  linkLabel = "Login",
  onSubmit,
  ...props
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const [apiError, setApiError] = useState(null);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className={cn("flex flex-col gap-6", className)}
          {...props}>
          <div className="grid mt-2.5 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
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
                  Sending...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </div>

          {linkUrl && (
            <div className="text-sm">
              {linkText}{" "}
              <Link to={linkUrl} className="underline underline-offset-4">
                {linkLabel}
              </Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
