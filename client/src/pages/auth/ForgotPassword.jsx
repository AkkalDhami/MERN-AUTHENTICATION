import React, { useState } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import CheckEmail from "../../components/auth/check-email";
import { useResetPasswordRequestMutation } from "../../features/auth/authApi";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [resetPasswordRequest] = useResetPasswordRequestMutation();

  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [email, setEmail] = useState("");

  const handleForgotPasswordSubmit = async (val) => {
    try {
      setEmail(val.email);
      const res = await resetPasswordRequest(val).unwrap();
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.error || error?.data?.message);
    }

    setIsFormSubmit(true);
  };
  return (
    <div className="grid min-h-svh">
      <div className="flex  items-center justify-center gap-4 p-3 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full mx-auto max-w-md">
            {isFormSubmit ? (
              <CheckEmail email={email} />
            ) : (
              <>
                <ForgotPasswordForm onsubmit={handleForgotPasswordSubmit} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
