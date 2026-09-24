import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const { handleVerifyEmail } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    // Token doesn't exist
    if (!token) {
      setStatus("error");
      return;
    }

    // Prevent duplicate API call in React StrictMode
    if (hasVerified.current) return;

    hasVerified.current = true;

    const verify = async () => {
      try {
        await handleVerifyEmail(token);

        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div
      className="flex min-h-screen flex-col selection:bg-[#C9A96E]/30 lg:flex-row"
      style={{
        backgroundColor: "#fbf9f6",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* LEFT PANEL */}
      <div className="group relative hidden overflow-hidden lg:flex lg:w-1/2">
        <img
          src="/snitch_editorial_warm.png"
          alt="Snitch editorial"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-6000 group-hover:scale-105"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(27,24,20,0.75) 0%, rgba(27,24,20,0.15) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex min-h-screen w-full items-center justify-center px-8 py-16 sm:px-14 lg:w-1/2 lg:px-20">
        <div className="w-full max-w-sm">
          {/* ================= LOADING ================= */}
          {status === "loading" && (
            <>
              <div className="mb-14">
                <p className="mb-4 text-[10px] font-medium tracking-[0.22em] text-[#C9A96E] uppercase">
                  Account Verification
                </p>

                <h1 className="text-[2.6rem] leading-[1.1] font-extralight tracking-tight text-[#1b1c1a] xl:text-5xl">
                  Verifying Email
                </h1>

                <div className="mt-4 h-px w-20 bg-[#C9A96E]" />
              </div>

              <div className="animate-in fade-in slide-in-from-top-4 text-center duration-700">
                <Loader2
                  size={48}
                  className="mx-auto mb-6 animate-spin text-[#C9A96E]"
                />

                <p className="text-sm leading-6 text-[#7A6E63]">
                  Please wait while we verify your email address.
                </p>
              </div>
            </>
          )}

          {/* ================= SUCCESS ================= */}
          {status === "success" && (
            <>
              <div className="mb-10">
                <p className="mb-4 text-[10px] font-medium tracking-[0.22em] text-[#C9A96E] uppercase">
                  Account Verified
                </p>

                <h1 className="text-[2.6rem] leading-[1.1] font-extralight tracking-tight text-[#1b1c1a] xl:text-5xl">
                  You&apos;re All Set
                </h1>

                <div className="mt-4 h-px w-20 bg-[#C9A96E]" />
              </div>

              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="mb-7 flex justify-center">
                  <CheckCircle
                    size={64}
                    strokeWidth={1.5}
                    className="text-green-600"
                  />
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-medium text-[#1b1c1a]">
                    Email Verified Successfully
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-[#7A6E63]">
                    Your email address has been verified. Your Snitch account is
                    now ready to use.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="mt-8 flex w-full items-center justify-center bg-[#1b1c1a] py-4 text-[11px] tracking-[0.25em] text-[#fbf9f6] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C9A96E] hover:shadow-lg"
                >
                  Continue to Login
                </Link>
              </div>
            </>
          )}

          {/* ================= ERROR ================= */}
          {status === "error" && (
            <>
              <div className="mb-10">
                <p className="mb-4 text-[10px] font-medium tracking-[0.22em] text-[#C9A96E] uppercase">
                  Account Verification
                </p>

                <h1 className="text-[2.6rem] leading-[1.1] font-extralight tracking-tight text-[#1b1c1a] xl:text-5xl">
                  Verification Failed
                </h1>

                <div className="mt-4 h-px w-20 bg-[#C9A96E]" />
              </div>

              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="mb-7 flex justify-center">
                  <XCircle
                    size={64}
                    strokeWidth={1.5}
                    className="text-red-500"
                  />
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-medium text-[#1b1c1a]">
                    Unable to Verify Email
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-[#7A6E63]">
                    This verification link is invalid or has expired. Please try
                    again with a valid verification link.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center bg-[#1b1c1a] py-4 text-[11px] tracking-[0.25em] text-[#fbf9f6] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C9A96E] hover:shadow-lg"
                  >
                    Go to Login
                  </Link>

                  <Link
                    to="/register"
                    className="flex w-full items-center justify-center border border-[#d0c5b5] py-4 text-[11px] tracking-[0.25em] text-[#7A6E63] uppercase transition-all duration-300 hover:border-[#C9A96E] hover:text-[#1b1c1a]"
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
