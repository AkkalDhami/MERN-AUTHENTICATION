import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaCheckSquare } from "react-icons/fa";
import { Link } from "react-router-dom";
const CheckEmail = ({ email }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl flex items-center gap-2 sm:text-2xl font-semibold">
            <FaCheckSquare className="text-green-600" />
            Reset Link Sent to your email
          </h2>
        </CardTitle>
        <CardDescription>
          Check Your Email {"<"}
          {email}
          {">"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        If the email that you have given us is correct, we have sent email to
        reset link to your email.
      </CardContent>
      <CardFooter>
        <div className="text-sm">
          Remember your password ?{" "}
          <Link to={"/login"} className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CheckEmail;
