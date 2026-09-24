"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { registerSchema, type RegisterFormData } from "../utils/zodSchema";
import ContinueWithGoogle from "./ContinueWithGoogle";

const RegisterForm = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isSeller: false,
    },
  });

  const isSeller = watch("isSeller");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await handleRegister(data);
      toast.success(res.message);

      navigate("/login");

      // if (res.user?.role === "buyer") {
      //   navigate("/");
      // } else if (res.user?.role === "seller") {
      //   navigate("/seller/dashboard");
      // }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col selection:bg-[#C9A96E]/30 lg:flex-row"
      style={{
        backgroundColor: "#fbf9f6",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* LEFT PANEL  */}

      <div className="group relative hidden overflow-hidden lg:flex lg:w-1/2">
        <img
          src="/snitch_editorial_warm.png"
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
      <div className="flex w-full items-center justify-center px-8 py-16 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* HEADER */}
          <div className="mb-12">
            <p className="mb-4 text-[10px] tracking-[0.22em] text-[#C9A96E] uppercase">
              Welcome to Vastra
            </p>
            <h1 className="text-[2.6rem] font-extralight tracking-tight text-[#1b1c1a]">
              Elevate Your Style
            </h1>
            <div className="mt-4 h-px w-20 bg-[#C9A96E]" />
          </div>

          {/* FORM */}
          <div className="animate-in fade-in slide-in-from-top-4 w-full max-w-sm duration-700">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-9"
            >
              {/* FULL NAME */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#7A6E63] uppercase">
                  Full Name
                </label>
                <input
                  {...register("fullname", { required: true })}
                  placeholder="e.g. John Doe"
                  className="w-full border-b border-[#d0c5b5] bg-transparent py-3 text-sm transition-all duration-300 outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* CONTACT */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#7A6E63] uppercase">
                  Contact Number
                </label>
                <input
                  {...register("contact", { required: true })}
                  placeholder="+91 98765 43210"
                  className="w-full border-b border-[#d0c5b5] bg-transparent py-3 text-sm transition-all duration-300 outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#7A6E63] uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="hello@example.com"
                  className="w-full border-b border-[#d0c5b5] bg-transparent py-3 text-sm transition-all duration-300 outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#7A6E63] uppercase">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className="w-full border-b border-[#d0c5b5] bg-transparent py-3 text-sm transition-all duration-300 outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* SELLER CHECKBOX */}
              <label className="flex cursor-pointer items-center gap-4">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("isSeller")}
                    className="peer sr-only focus:border-[#C9A96E]"
                  />
                  <div
                    className="flex h-4 w-4 items-center justify-center border"
                    style={{
                      borderColor: isSeller ? "#C9A96E" : "#d0c5b5",
                      backgroundColor: isSeller ? "#C9A96E" : "transparent",
                    }}
                  >
                    {isSeller && (
                      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="#fbf9f6"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <span
                  className="text-[11px] uppercase"
                  style={{ color: isSeller ? "#C9A96E" : "#7A6E63" }}
                >
                  Register as Seller
                </span>
              </label>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1b1c1a] py-4 text-[11px] tracking-[0.25em] text-[#fbf9f6] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C9A96E] hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[#e4e2df]" />
                <span className="text-[10px] text-[#B5ADA3]">or</span>
                <div className="h-px flex-1 bg-[#e4e2df]" />
              </div>

              <ContinueWithGoogle />

              {/* FOOTER */}
              <p className="text-center text-[11px] text-[#B5ADA3]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#7A6E63] underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
