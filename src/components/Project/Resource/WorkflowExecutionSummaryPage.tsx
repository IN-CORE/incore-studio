import React, { useEffect } from "react";
import { Box, Container, Typography, Divider } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { getProject } from "@app/reducer/projectSlice";
import { getWorkflow, raiseWorkflowError } from "@app/reducer/workflowSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import withLoading from "@app/components/hocs/withLoading";
import WorkflowSummary from "@app/components/Workflow/WorkflowSummary";
import { useSummaryStore, type SummaryReactFlowStoreState } from "@app/components/Workflow/reactFlowStore";
import { getWorkflowSummary } from "@app/components/Workflow/workflowUtils";
import ExecutionCards from "./ExecutionCards";

const selector = (state: SummaryReactFlowStoreState) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const WorkflowExecutionSummaryComponent: React.FC<{
    projectId: string | undefined;
    projectName: string | undefined;
    isFinalized: boolean | undefined;
    currentWorkflow: DatawolfWorkflowFile | null;
    reactFlowWorkflow: ReactFlowWorkflow;
}> = ({ projectId, projectName, currentWorkflow, reactFlowWorkflow, isFinalized }): JSX.Element => {
    // const appDispatch = useAppDispatch();
    const { setNodes, setEdges } = useSummaryStore(useShallow(selector));

    React.useEffect(() => {
        if (reactFlowWorkflow.nodes.length !== 0) {
            let { nodes, edges } = getWorkflowSummary(reactFlowWorkflow);
            setNodes(nodes);
            setEdges(edges);
        }
    }, [reactFlowWorkflow]);

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
            <Box sx={{ flexShrink: 0 }} mt={5}>
                {/* Header Section */}
                <ProjectBreadcrumb
                    project={{ href: `/project/${projectId}`, label: projectName }}
                    resource="Workflows"
                    resourceName={currentWorkflow?.title}
                />
                <Box sx={{ display: "flex", flexGrow: 1, height: "500px", width: "100%" }}>
                    <WorkflowSummary isFinalized={isFinalized} wfId={currentWorkflow?.id} projectId={projectId} />
                </Box>
            </Box>
            <Box mt={5}>
                <Typography level="h3" textColor="primary.main" fontWeight="lg" mb={2}>
                    Executions
                </Typography>
                <Divider />
                <ExecutionCards wfId={currentWorkflow?.id} projectId={projectId} isFinalized={isFinalized} />
            </Box>
        </Container>
    );
};

const WorkflowExecutionSummaryComponentWithErrorHandling = withErrorHandling(WorkflowExecutionSummaryComponent);
const WorkflowExecutionSummaryComponentWithLoadingAndErrorHandling = withLoading(
    WorkflowExecutionSummaryComponentWithErrorHandling
);

const WorkflowExecutionSummaryPage = (): JSX.Element => {
    const appDispatch = useAppDispatch();
    const { id, wfID } = useParams(); // Get projectId and workflowId from the URL path

    const project = useAppSelector((state) => state.project.project);
    const loading = useAppSelector((state) => state.project.loading);
    const error = useAppSelector((state) => state.project.error);

    const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);
    const reactFlowWorkflow = useAppSelector((state) => state.workflow.reactFlowWorkflow);

    useEffect(() => {
        if (project !== null && wfID) {
            const projWorkflowID: Workflow | undefined = project.workflows.find((wf: Workflow) => wf.id === wfID);
            if (projWorkflowID) {
                appDispatch(getWorkflow({ workflowID: wfID }));
            } else {
                raiseWorkflowError(`Failed to find workflow with id: ${wfID} in project with id: ${id}`);
            }
        }
    }, [project, wfID]);

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    return (
        <WorkflowExecutionSummaryComponentWithLoadingAndErrorHandling
            error={error || workflowError}
            isLoading={loading && workflowLoading}
            projectId={id}
            projectName={project?.name}
            isFinalized={project?.workflows.find((wf: Workflow) => wf.id === wfID)?.isFinalized}
            currentWorkflow={currentWorkflow}
            reactFlowWorkflow={reactFlowWorkflow}
        />
    );
};

export default WorkflowExecutionSummaryPage;
