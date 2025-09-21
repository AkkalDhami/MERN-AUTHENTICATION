import React, { useState } from "react";
import { ResetPasswordForm } from "../../components/auth/reset-passwd-form";
import toast from "react-hot-toast";
import {
  useChangePasswordMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/auth/input-otp";
import { AuthEmailForm } from "../../components/auth/auth-email-form";
import { VerifyEmailSchema } from "../../schemas/auth";

const ChangePassword = () => {
  const [changePassword] = useChangePasswordMutation();
  const [requestOtp, { error: otpError }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const navigate = useNavigate();

  const [isOtpSent, setIsOtpSent] = useState(true);
  const [isGettingEmail, setIsGettingEmail] = useState(false);
  const [email, setEmail] = useState("");

  const handleOtpRequest = async (data) => {
    try {
      const res = await requestOtp({
        email: data?.email,
        purpose: "password-change",
      }).unwrap();
      if (otpError) toast.error(otpError?.message);
      toast.success(res?.message);
      setIsGettingEmail(true);
      setEmail(data?.email);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message  || err?.message || "Failed to request OTP"
      );
    }
  };

  const handleChangePasswordForm = async (data) => {
    try {
      const res = await changePassword(data).unwrap();
      toast.success(res?.message);
      navigate("/profile");
    } catch (err) {
      console.log(err);
      toast.error(err?.error || err?.data?.message);
    }
  };

  const handleOtpSubmit = async (data) => {
    try {
      const res = await verifyOtp({
        code: data,
        email,
        purpose: "password-change",
      }).unwrap();
      if (error) toast.error(error.message);
      toast.success(res?.message);
      setIsOtpSent(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err?.message);
    }
  };

  return (
    <div className="grid min-h-svh">
      <div className="flex  items-center justify-center gap-4 p-3 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full mx-auto max-w-md">
            {!isGettingEmail ? (
              <AuthEmailForm
                schema={VerifyEmailSchema}
                title="Change Password?"
                description="Enter your email and we'll send you an OTP."
                buttonText="Send OTP"
                linkText="Back to profile?"
                linkUrl="/profile"
                linkLabel="Profile"
                onSubmit={handleOtpRequest}
              />
            ) : isOtpSent ? (
              <OtpInput isLoading={isLoading} onsubmit={handleOtpSubmit} />
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
