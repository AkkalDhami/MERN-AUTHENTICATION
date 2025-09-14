import React from "react";
import { ResetPasswordForm } from "../../components/auth/reset-passwd-form";
import { useNavigate, useParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../features/auth/authApi";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const [resetPassword] = useResetPasswordMutation();
  console.log(params);

  const token = params.token;
  console.log(token);

  const handleResetPasswordForm = async (data) => {
    console.log(data);
    try {
      const res = await resetPassword({ data, token }).unwrap();
      console.log(res);
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message);
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error(err?.error || err?.data?.message);
    }
  };
  return (
    <div className="grid min-h-svh">
      <div className="flex  items-center justify-center gap-4 p-3 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full mx-auto max-w-md">
            <ResetPasswordForm onsubmit={handleResetPasswordForm} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
