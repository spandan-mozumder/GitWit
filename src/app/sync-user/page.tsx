"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/ui/spinner";

const SyncUser = () => {
  const router = useRouter();

  useEffect(() => {
    const syncAndRedirect = async () => {
      try {
        const response = await fetch("/api/sync-user", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to sync user");
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    };

    syncAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Spinner className="h-8 w-8 mx-auto" />
        <div>
          <h1 className="text-2xl font-bold">Setting up your account...</h1>
          <p className="text-muted-foreground">
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyncUser;
