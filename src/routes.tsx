import React, { Suspense, lazy } from "react";
import Loading from "./components/Loading";

const LazyHome = lazy(() => import("./components/Home"));
const LazyExecution = lazy(() => import("./components/Execution"));
const LazyProjectPage = lazy(() => import("./components/Project/ProjectPage"));
const LazyProjectDatasetsPage = lazy(() => import("./components/Project/Resource/DatasetPage"));
const LazyProjectHazardsPage = lazy(() => import("./components/Project/Resource/HazardPage"));
const LazyProjectVisualizationsPage = lazy(() => import("./components/Project/Resource/VisualizationPage"));
const LazyProjectWorkflowsPage = lazy(() => import("./components/Project/Resource/WorkflowPage"));
const LazyProjectDFR3MappingPage = lazy(() => import("./components/Project/Resource/DFR3MappingPage"));

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
    },
    "/project/:id/datasets": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectDatasetsPage />
            </Suspense>
        )
    },
    "/project/:id/hazards": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectHazardsPage />
            </Suspense>
        )
    },
    "/project/:id/visualizations": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectVisualizationsPage />
            </Suspense>
        )
    },
    "/project/:id/workflows": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectWorkflowsPage />
            </Suspense>
        )
    },
    "/project/:id/dfr3mappings": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectDFR3MappingPage />
            </Suspense>
        )
    }
};

export default routes;
