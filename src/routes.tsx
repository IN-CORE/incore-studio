import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

const LazyHome = lazy(() => import("@app/components/Home"));
const LazyWorkflowEditor = lazy(() => import("./components/WorkflowEditor"));
const LazyProjectDatasetPage = lazy(() => import("@app/components/Project/Resource/DatasetPage"));
const LazyProjectDashboard = lazy(() => import("@app/components/Project/ProjectDashboard"));
const LazyProjectHazardsPage = lazy(() => import("@app/components/Project/Resource/HazardPage"));
const LazyProjectVisualizationsPage = lazy(() => import("@app/components/Project/Resource/VisualizationPage"));
const LazyProjectWorkflowsPage = lazy(() => import("@app/components/Project/Resource/WorkflowPage"));
const LazyProjectDFR3MappingPage = lazy(() => import("@app/components/Project/Resource/DFR3MappingPage"));
const LazyProjectWorkflowExecutionSummaryPage = lazy(
    () => import("@app/components/Project/Resource/WorkflowExecutionSummaryPage")
);
const LazyExecutionPage = lazy(() => import("@app/components/Execution"));

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
    "/project/:id": {
        element: (
            <Suspense fallback={<Loading />}>
                {/* <LazyProjectPage /> */}
                <LazyProjectDashboard />
            </Suspense>
        )
    },
    "/project/:id/datasets": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectDatasetPage />
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
    "/project/:id/workflows/:wfID/execution/:exId": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyExecutionPage create={false} key="existing-execution-page" />
            </Suspense>
        )
    },
    "/project/:id/workflows/:wfID/execution/create": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyExecutionPage create key="create-new-execution-page" />
            </Suspense>
        )
    },
    "/project/:id/workflows/:wfID/workflow-editor": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyWorkflowEditor />
            </Suspense>
        )
    },
    "/project/:id/workflows/:wfID": {
        element: (
            <Suspense fallback={<Loading />}>
                <LazyProjectWorkflowExecutionSummaryPage />
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
