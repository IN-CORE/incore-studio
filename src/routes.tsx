import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

const LazyHome = lazy(() => import("@app/components/Home"));
const ProjectDatasetPage = lazy(() => import("@app/components/Project/Resource/DatasetPage"));
const ProjectPage = lazy(() => import("@app/components/Project/ProjectPage"));
const ProjectHazardsPage = lazy(() => import("@app/components/Project/Resource/HazardPage"));
const ProjectVisualizationsPage = lazy(() => import("@app/components/Project/Resource/VisualizationPage"));
const ProjectWorkflowsPage = lazy(() => import("@app/components/Project/Resource/WorkflowPage"));
const ProjectDFR3MappingPage = lazy(() => import("@app/components/Project/Resource/DFR3MappingPage"));
const LazyWorkflowEditor = lazy(() => import("@app/components/WorkflowEditor"));

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
    "/project/:id": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectPage />
            </Suspense>
        )
    },
    "/project/:id/datasets": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectDatasetPage />
            </Suspense>
        )
    },
    "/project/:id/hazards": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectHazardsPage />
            </Suspense>
        )
    },
    "/project/:id/visualizations": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectVisualizationsPage />
            </Suspense>
        )
    },
    "/project/:id/workflows": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectWorkflowsPage />
            </Suspense>
        )
    },
    "/project/:id/dfr3mappings": {
        element: (
            <Suspense fallback={<Loading />}>
                <ProjectDFR3MappingPage />
            </Suspense>
        )
    }
};

export default routes;
