import React, { useState } from "react";
import { ResetPasswordForm } from "../../components/auth/reset-passwd-form";
import toast from "react-hot-toast";
import {
  useChangePasswordMutation,
  useVerifyOtpMutation,
} from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/auth/input-otp";

const ChangePassword = () => {
  const [changePassword] = useChangePasswordMutation();
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const navigate = useNavigate();

  const [isOtpSent, setIsOtpSent] = useState(true);

  const handleChangePasswordForm = async (data) => {
    try {
      console.log(data);
      const res = await changePassword(data).unwrap();
      console.log(res);
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message);
      navigate("/profile");
    } catch (err) {
      console.log(err);
      toast.error(err?.error || err?.data?.message);
    }
  };

  const handleOtpSubmit = async (data) => {
    try {
      const res = await verifyOtp({ code: data }).unwrap();
      if (error) toast.error(error.message);
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message);
      setIsOtpSent(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err?.message);
    }
    console.log(isOtpSent);
  };

  return (
    <div className="grid min-h-svh">
      <div className="flex  items-center justify-center gap-4 p-3 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full mx-auto max-w-md">
            {isOtpSent ? (
              <OtpInput isLoading={isLoading} onSubmit={handleOtpSubmit} />
            ) : (
              <ResetPasswordForm
                isChangePassword={true}
                onsubmit={handleChangePasswordForm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
