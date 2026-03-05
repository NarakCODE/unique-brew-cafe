"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { parseVerifyOtpQuery } from "@/lib/query-schemas"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useVerifyOtp } from "@/hooks/use-verify-otp"
import { useResendOtp } from "@/hooks/use-resend-otp"

const otpFormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

type OtpFormValues = z.infer<typeof otpFormSchema>

export function OtpForm({ className, ...props }: React.ComponentProps<"div">) {
  const searchParams = useSearchParams()
  const { email } = parseVerifyOtpQuery(searchParams)
  const router = useRouter()
  const { verifyOtp, isLoading } = useVerifyOtp()
  const { resendOtp, isLoading: isResending } = useResendOtp()

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      // router.push("/sign-up") // Optional: redirect back if no email
    }
  }, [email, router])

  function onSubmit(data: OtpFormValues) {
    if (!email) {
      return
    }
    // Retrieve stored registration data
    const storedData =
      typeof window !== "undefined"
        ? sessionStorage.getItem("registrationData")
        : null
    let additionalData = {}

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.email === email) {
          additionalData = {
            fullName: parsedData.fullName,
            password: parsedData.password,
          }
        }
      } catch (e) {
        console.error("Failed to parse registration data", e)
      }
    }

    verifyOtp({
      email,
      otpCode: data.otp,
      ...additionalData,
    })
  }

  function handleResendOtp() {
    if (!email) return
    resendOtp({
      email,
      verificationType: "registration",
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify your account</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email || "your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">
                          One-Time Password
                        </FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-sm">
        Didn&apos;t receive a code?{" "}
        <Button
          variant="link"
          className="p-0 h-auto font-normal underline underline-offset-4"
          type="button"
          disabled={isResending || !email}
          onClick={handleResendOtp}
        >
          {isResending ? "Resending..." : "Resend"}
        </Button>
      </div>
    </div>
  )
}
