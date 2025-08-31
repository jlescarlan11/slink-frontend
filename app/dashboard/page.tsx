import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React from "react";
import Graph from "./Graph";
import { dummyData } from "./dummyData";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <div className="">
        <Graph graphData={dummyData} />
      </div>
      <div className="sm:text-end text-center mt-8">
        <Button>Create new short URL</Button>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
