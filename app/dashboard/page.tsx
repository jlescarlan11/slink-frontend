import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React from "react";

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <div className="">DashboardPage</div>;
    </ProtectedRoute>
  );
};

export default DashboardPage;
