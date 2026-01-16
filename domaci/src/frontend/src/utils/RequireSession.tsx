import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type AuthStatus = "checking" | "authed" | "unauthed";

export default function RequireSession() {
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch("https://hak.hoi5.com/api/account", {
          method: "GET",
          credentials: "include", // 🔑 send sessid cookie
          headers: {
            Accept: "application/json",
          },
        });

        if (cancelled) return;

        if (res.status === 200) {
          setStatus("authed");
        } else {
          setStatus("unauthed");
        }
      } catch {
        if (!cancelled) {
          setStatus("unauthed");
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return null; // or <LoadingSpinner />
  }

  if (status === "unauthed") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
