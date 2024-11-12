import React, { useEffect } from "react";
import { Box, Container } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { getProject } from "@app/reducer/projectSlice";
import { getWorkflow } from "@app/reducer/workflowSlice";
import Navbar from "@app/components/Navigation/Navbar";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import withLoading from "@app/components/hocs/withLoading";

const WorkflowExecutionSummaryComponent: React.FC<{
    projectId: string | undefined;
    projectName: string | undefined;
    currentWorkflow: DatawolfWorkflowFile | null;
}> = ({ projectId, projectName, currentWorkflow }): JSX.Element => {
    // const dispatch = useAppDispatch();

    return (
        <>
            <Navbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    {/* Header Section */}
                    <ProjectBreadcrumb
                        project={{ href: `/project/${projectId}`, label: projectName }}
                        resource="Workflows"
                        resourceName={currentWorkflow?.title}
                    />
                </Box>
            </Container>
        </>
    );
};

const WorkflowExecutionSummaryComponentWithErrorHandling = withErrorHandling(WorkflowExecutionSummaryComponent);
const WorkflowExecutionSummaryComponentWithLoadingAndErrorHandling = withLoading(
    WorkflowExecutionSummaryComponentWithErrorHandling
);

const WorkflowExecutionSummaryPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { id, wfID } = useParams(); // Get projectId and workflowId from the URL path

    const project = useAppSelector((state) => state.project.project);
    const loading = useAppSelector((state) => state.project.loading);
    const error = useAppSelector((state) => state.project.error);

    const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);

    useEffect(() => {
        if (wfID) {
            dispatch(getWorkflow({ workflowID: wfID }));
        }
    }, [wfID]);

    useEffect(() => {
        if (id) {
            dispatch(getProject(id));
        }
    }, [id]);

    return (
        <WorkflowExecutionSummaryComponentWithLoadingAndErrorHandling
            error={error || workflowError}
            isLoading={loading && workflowLoading}
            projectId={id}
            projectName={project?.name}
            currentWorkflow={currentWorkflow}
        />
    );
};

export default WorkflowExecutionSummaryPage;
