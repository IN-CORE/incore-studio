import React, { Suspense, lazy } from "react";
import Loading from "./components/Loading";

const LazyHome = lazy(() => import("./components/Home"));
const LazyExecution = lazy(() => import("./components/Execution"));
const LazyProjectPage = lazy(() => import("./components/Project/ProjectPage"));

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
    },
    "/project/:id": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectPage />
            </Suspense>
        )
    }
};

export default routes;
