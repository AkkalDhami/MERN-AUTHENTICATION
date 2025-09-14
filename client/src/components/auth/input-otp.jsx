import React, { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function OtpInput({ length = 6, onsubmit, isLoading }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const updatedOtp = pastedData
      .split("")
      .concat(Array(length).fill(""))
      .slice(0, length);
    setOtp(updatedOtp);

    if (inputRefs.current[length - 1]) {
      inputRefs.current[length - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== length) {
      alert("Please enter complete OTP");
      return;
    }
    onsubmit(otpValue);
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg sm:text-xl font-semibold">
            Enter the OTP sent to your email
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-">
          <div className="flex gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-13 h-13 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:border-zinc-800 transition-all"
              />
            ))}
          </div>

          <Button
            size="lg"
            type="submit"
            disabled={otp.join("").length !== length}
            className="w-full mt-3 disabled:bg-gray-400">
            {isLoading ? (
              <>
                <Loader className="animate-spin" /> Verifying OTP....
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
