import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

const LazyHome = lazy(() => import("@app/components/Home"));
const LazyExecution = lazy(() => import("@app/components/Execution"));
const LazyProjectPage = lazy(() => import("@app/components/Project/ProjectPage"));
const LazyProjectDatasetsPage = lazy(() => import("@app/components/Project/Resource/DatasetPage"));
const LazyProjectHazardsPage = lazy(() => import("@app/components/Project/Resource/HazardPage"));
const LazyProjectVisualizationsPage = lazy(() => import("@app/components/Project/Resource/VisualizationPage"));
const LazyProjectWorkflowsPage = lazy(() => import("@app/components/Project/Resource/WorkflowPage"));
const LazyProjectDFR3MappingPage = lazy(() => import("@app/components/Project/Resource/DFR3MappingPage"));

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
