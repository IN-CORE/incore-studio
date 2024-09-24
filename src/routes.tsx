import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

<<<<<<< HEAD
const LazyHome = lazy(() => import("@app/components/Home"));
const LazyWorkflowEditor = lazy(() => import("@app/components/WorkflowEditor"));
=======
const LazyHome = lazy(() => import("./components/Home"));
const LazyExecution = lazy(() => import("./components/Execution"));
const LazyWorkflowEditor = lazy(() => import("./components/WorkflowEditor"));
>>>>>>> fdad745 (make create workflow component)

/**
 A mapping of routes to `RouteProps`.
 The required property for each route is `element`, which must be a valid React component.

 This mapping is used in `src/app.tsx` to set up all the routes.
 * */
const routes: { [key: string]: import("react-router-dom").RouteProps } = {
    "/": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyHome />
            </Suspense>
        )
    },
    "/workflow-editor/:wfID": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyWorkflowEditor />
            </Suspense>
        )
    },
    "/workflow-editor": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyWorkflowEditor />
            </Suspense>
        )
    }
};

export default routes;
