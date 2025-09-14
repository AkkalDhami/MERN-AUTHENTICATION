import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ResetPasswordSchema, setPasswordSchema } from "../../schemas/auth";
import toast from "react-hot-toast";
import { useState } from "react";
import { Loader } from "lucide-react";

export function ResetPasswordForm({
  className,
  onsubmit,
  isChangePassword = false,
  ...props
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      isChangePassword ? setPasswordSchema : ResetPasswordSchema
    ),
    mode: "onTouched",
  });



  const [apiError, setApiError] = useState(null);

  const handleResetPasswordSubmit = async (data) => {
    try {
      await onsubmit(data);
    } catch (err) {
      toast.error(err.message);
      setApiError("Something went wrong. Please try again.");
    }
  };



  const handleChangePasswordSubmit = async (data) => {
    try {
      await onsubmit(data);
    } catch (err) {
      toast.error(err.message);
      setApiError("Something went wrong. Please try again.");
    }
  };

  if (apiError) {
    toast.error(apiError);
    setApiError(null);
  }

  return (
    <>
      <Card className="gap-0">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {isChangePassword ? "Change" : "Reset"} Your Password
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              isChangePassword
                ? handleChangePasswordSubmit
                : handleResetPasswordSubmit
            )}
            className={cn("flex flex-col gap-6", className)}
            {...props}>
            <div className="grid mt-2.5 gap-4">
              {isChangePassword ? (
                <div className="grid gap-3">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Your current password"
                    {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>
              ) : (
                ""
              )}
              <div className="grid gap-3">
                <Label htmlFor="password">New Password *</Label>
                <Input
                  id="password"
                  name="newPassword"
                  type="password"
                  placeholder="Your new password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmNewPassword">
                  Confirm New Password *
                </Label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  {...register("confirmNewPassword")}
                />
                {errors.confirmNewPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

              <Button size="lg" type="submit" className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-6 w-6 animate-spin" />
                    {isChangePassword ? "Changing..." : "Resetting..."}
                  </>
                ) : isChangePassword ? (
                  "Change Password"
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
            <div className="text-sm">
              {isChangePassword ? (
                <>
                  Back to Profile Page ?{" "}
                  <Link
                    to={"/profile"}
                    className="underline underline-offset-4">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  Back to Login?{" "}
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
