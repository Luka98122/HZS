import { useEffect } from "react";

const Logout: React.FC = () => {
  useEffect(() => {
    const logout = async () => {
      console.log("pre")
      try {
        await fetch("https://hak.hoi5.com/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        console.log("pre2")
        // Wipe client-side storage
        localStorage.clear();
        sessionStorage.clear();
        console.log("post")
        // Redirect
        window.location.href = "https://react.hoi5.com";
      }
    };

    logout();
  }, []);

  return <p>Logging you out…</p>;
};

export default Logout;
