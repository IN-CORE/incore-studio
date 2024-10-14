import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

const LazyHome = lazy(() => import("@app/components/Home"));
const LazyExecution = lazy(() => import("@app/components/Execution"));

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
    "/execution": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyExecution />
            </Suspense>
        )
    }
};

export default routes;
