import React, { Suspense } from "react";
import ClientCourses from "./ClientCourses";

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading courses...</div>}>
      <ClientCourses />
    </Suspense>
  );

}
