import { useAuthStore } from "@/stores/useAuthStore";
import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);

  const init = useCallback(async () => {
    if (!accessToken) {
      await refresh(true);
      setStarting(false);
      return;
    }

    if (accessToken && !user) {
      await fetchMe();
    }

    setStarting(false);
  }, [accessToken, fetchMe, refresh, user]);

  useEffect(() => {
    void init();
  }, [init]);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
