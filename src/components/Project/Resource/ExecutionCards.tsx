import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { Alert, Grid, Link, Box, Stack, Card, CardContent, Chip, Typography, Button, useTheme } from "@mui/joy";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { parseDateTime } from "@app/utils";
import { getExecutionsByWorkflowID } from "@app/reducer/workflowSlice";
import { finalizeWorkflow } from "@app/reducer/projectSlice";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import withLoading from "@app/components/hocs/withLoading";
import { extractStatus } from "@app/utils";
import FinalizeWorkflowDialog from "@app/components/FinalizeWorkflowDialog";

const ExecutionCardsComponent: React.FC<{
    executions: DatawolfExecutionFile[];
    projectId: string | undefined;
    wfId: string | undefined | null;
    isFinalized: boolean | undefined;
}> = ({ executions, projectId, isFinalized, wfId }) => {
    // TODO: implement polling of datawolf to get current status
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [openFinalize, setOpenFinalize] = React.useState(false);
    const [confirmFinalize, setConfirmFinalize] = React.useState(false);

    React.useEffect(() => {
        if (confirmFinalize && wfId && projectId) {
            dispatch(finalizeWorkflow({ projectId, workflowId: wfId }));
            navigate(`/project/${projectId}/workflows/${wfId}/execution/create`);
        }
    }, [confirmFinalize]);

    return (
        <Grid container spacing={3}>
            {executions.length === 0 && (
                <Grid xs={12}>
                    <Stack direction="column" spacing={3}>
                        <Alert startDecorator={<ErrorOutlineRoundedIcon />} color="primary">
                            No executions found.
                        </Alert>
                        <FinalizeWorkflowDialog
                            open={openFinalize}
                            onClose={() => setOpenFinalize(false)}
                            confirmFinalize={() => setConfirmFinalize(true)}
                        />
                        <Button
                            variant="solid"
                            sx={{ backgroundColor: "primary.main" }}
                            startDecorator={<AddRoundedIcon />}
                            onClick={() => {
                                if (isFinalized) {
                                    navigate(`/project/${projectId}/workflows/${wfId}/execution/create`);
                                } else {
                                    setOpenFinalize(true);
                                }
                            }}
                        >
                            Create New Execution
                        </Button>
                    </Stack>
                </Grid>
            )}
            {executions.length !== 0 &&
                executions.map((execution) => {
                    let status = extractStatus(execution);
                    let chipColors: Array<"danger" | "warning" | "success" | "primary"> = [
                        "danger",
                        "warning",
                        "success",
                        "primary"
                    ];
                    let checkColors = [
                        theme.palette.danger[400],
                        theme.palette.warning[400],
                        theme.palette.success[400],
                        theme.palette.primary[400]
                    ];
                    let chipColor =
                        ["FAILED", "ABORTED"].indexOf(status) >= 0
                            ? 0
                            : ["RUNNING", "QUEUED", "WAITING"].indexOf(status) >= 0
                              ? 1
                              : ["UNKNOWN", "UNDEFINED"].indexOf(status) >= 0
                                ? 3
                                : 2;
                    return (
                        <Grid key={execution.id} xs={12} sm={12} md={6} lg={4}>
                            {/* TODO: add link to execution page to see results and parameters. */}
                            <Card
                                variant="outlined"
                                sx={{
                                    "position": "relative",
                                    "display": "flex",
                                    "flexDirection": "column",
                                    "height": "100%",
                                    "padding": 2,
                                    "&:hover": { boxShadow: "md", borderColor: "neutral.outlinedHoverBorder" }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {/* <Typography level="h3" textColor="primary.main">
                                                {execution.title}
                                            </Typography> */}
                                            <Typography level="h3" sx={{ mb: 1 }}>
                                                <Link
                                                    overlay
                                                    component={RouterLink}
                                                    underline="none"
                                                    to={`/project/${projectId}/workflows/${execution.workflowId}/execution/${execution.id}`}
                                                    sx={{ color: "text.tertiary" }}
                                                >
                                                    {execution.title}
                                                </Link>
                                            </Typography>
                                            <CheckCircleRoundedIcon sx={{ color: checkColors[chipColor] }} />
                                        </Stack>
                                        <Typography level="body-sm">
                                            {execution.description || "Description not provided"}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <Box
                                    sx={{
                                        mt: "auto",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    {/* Pill for resource type */}
                                    <Chip size="sm" color={chipColors[chipColor]} sx={{ borderRadius: 0 }}>
                                        {status}
                                    </Chip>

                                    {/* Date on the right */}
                                    <Typography level="body-sm">
                                        {execution.date ? parseDateTime(execution.date) : "Date not provided"}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
        </Grid>
    );
};

const ExecutionCardsWithErrorHandlingAndLoading = withErrorHandling(withLoading(ExecutionCardsComponent));

const ExecutionCards: React.FC<{
    wfId: string | null | undefined;
    projectId: string | undefined;
    isFinalized: boolean | undefined;
}> = ({ wfId, projectId, isFinalized }) => {
    const dispatch = useAppDispatch();
    const executions = useAppSelector((state) => state.workflow.executions);
    const loading = useAppSelector((state) => state.workflow.loading);
    const error = useAppSelector((state) => state.workflow.error);

    React.useEffect(() => {
        if (wfId && executions.length === 0) {
            dispatch(getExecutionsByWorkflowID({ workflowID: wfId }));
        }
    }, [wfId]);

    React.useEffect(() => {
        if (wfId && executions.length === 0) {
            dispatch(getExecutionsByWorkflowID({ workflowID: wfId }));
        }
    }, []);

    return (
        <Box mt={2}>
            <ExecutionCardsWithErrorHandlingAndLoading
                isLoading={loading}
                error={error}
                executions={executions}
                wfId={wfId}
                projectId={projectId}
                isFinalized={isFinalized}
            />
        </Box>
    );
};

export default ExecutionCards;
