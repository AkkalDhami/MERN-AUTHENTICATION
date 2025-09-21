import * as z from "zod";

export const nameSchema = z.string().trim()
    .min(3, {
        message: "Name must be at least 3 characters long"
    })
    .max(50, {
        message: "Name must be at most 50 characters long"
    });

export const passwordSchema = z.string().trim()
    .min(6, {
        message: "Password must be at least 6 characters long"
    })
    .max(80, {
        message: "Password must be at most 80 characters long"
    });

export const emailSchema = z
    .string()
    .trim()
    .min(1, "Email is required")
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must be no more than 100 characters." });

export const LoginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export const RegisterSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => {
    return data.password === data.confirmPassword
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const ForgotPasswordSchema = z.object({
    email: emailSchema,
});

export const VerifyEmailSchema = z.object({
    email: emailSchema,
});

export const ResetPasswordSchema = z.object({
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"]
})

export const setPasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"]
})
