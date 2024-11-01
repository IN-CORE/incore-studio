import React, { Suspense, lazy } from "react";
import Loading from "@app/components/Loading";

import ProjectDatasetPage from "@app/components/Project/Resource/DatasetPage";
import ProjectPage from "@app/components/Project/ProjectPage";
import ProjectHazardsPage from "@app/components/Project/Resource/HazardPage";
import ProjectVisualizationsPage from "@app/components/Project/Resource/VisualizationPage";
import ProjectWorkflowsPage from "@app/components/Project/Resource/WorkflowPage";
import ProjectDFR3MappingPage from "@app/components/Project/Resource/DFR3MappingPage";

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
