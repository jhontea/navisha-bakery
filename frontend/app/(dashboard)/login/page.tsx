"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const success = await login(tokenResponse.access_token);
        if (success) {
          router.push("/dashboard");
        } else {
          alert("Unauthorized: Your email is not registered as an admin.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      alert("Google login failed. Please try again.");
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed opacity-20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-fixed-dim opacity-10 blur-3xl rounded-full" />
      </div>

      {/* Login Card */}
      <main className="relative w-full max-w-md px-6 animate-rise">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-6 rounded-full bg-surface-card shadow-sm flex items-center justify-center overflow-hidden border-4 border-surface-container transition-transform duration-500 hover:rotate-6">
            <img
              alt="Navisha Bakery Logo"
              className="w-20 h-20 object-contain"
              src="https://lh3.googleusercontent.com/aida/AP1WRLsstEkjypN0gH1SyZghbtR9gVbByURakG9K8ouRlC-53ahANtnoaw4yw5mSeGxdjjBnIdfekDm73W2mAmbtVJRJyQhTiUrZNATp6TFjOn_kFQU1LnKd7rNpVEqb61nt5mrV4DvWGFxmW69yAr7Mgfm02pIdmwt58hUnXxTJ-qMOG5IcBCOli95b6u-atNMnvwo35aOx6V6RDxvkur7VWQQYVMQJLqCuMu0CmUTMolxkfvK8yAfSC3oN1zAc"
            />
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary text-center tracking-tight mb-2">
            Navisha Bakery
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant tracking-wide">
            Artisanal Admin Portal
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-surface-card rounded-xl shadow-sm border border-outline-variant/30 p-8 md:p-10 transition-all duration-300 hover:shadow-md">
          <div className="text-center mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
              Internal Access Only
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant px-4">
              Welcome back. Please use your corporate Google account to manage
              the bakery.
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-card border border-outline-variant text-on-surface font-label-md rounded-lg hover:bg-surface-container-low active:scale-95 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-primary">Connecting...</span>
              </div>
            ) : (
              <>
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="group-hover:text-primary transition-colors">
                  Sign in with Google
                </span>
              </>
            )}
          </button>

          {/* Security Footer */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-outline-variant" />
              <span className="material-symbols-outlined text-outline text-lg">lock</span>
              <div className="h-px w-8 bg-outline-variant" />
            </div>
            <div className="bg-surface-container-low rounded-lg p-4 w-full">
              <p className="font-label-sm text-label-sm text-on-surface-variant text-center leading-relaxed">
                <span className="font-bold text-primary">Security Note:</span> This is a
                restricted administrative system. Access is monitored and strictly
                limited to authorized personnel of Navisha Bakery.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-8 text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
            © {new Date().getFullYear()} Navisha Bakery. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">
              Support
            </a>
            <span className="text-outline-variant">•</span>
            <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">
              Privacy Policy
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}