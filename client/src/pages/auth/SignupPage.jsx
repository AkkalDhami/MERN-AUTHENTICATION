import { SignupForm } from "@/components/auth/signup-form";
import { useRegisterMutation } from "../../features/auth/authApi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [register] = useRegisterMutation();
  const dispatch = useDispatch();

  const navigate = useNavigate()

  const handleRegisterUser = async (data) => {

    try {
      const res = await register(data).unwrap();
      console.log(res);
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message);
      dispatch(
        setCredentials({
          user: res?.user,
          accessToken: res?.accessToken,
        })
      );
      navigate('/profile')
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
            <SignupForm onsubmit={handleRegisterUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
