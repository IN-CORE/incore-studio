import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Button, Typography, Stack, Tooltip, IconButton } from "@mui/joy";
import { getExecutionById, resetExecutionState } from "@app/reducer/executionSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import withLoading from "@app/components/hocs/withLoading";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import { ReactSVG } from "react-svg";

const ExecutionComponent: React.FC<{ currentExecution: DatawolfExecutionFile | null }> = ({
    currentExecution
}): JSX.Element => {
    const navigate = useNavigate();
    const appDispatch = useAppDispatch();

    const handleBackClick = () => {
        appDispatch(resetExecutionState());
        navigate(-1);
    };
    console.log("currentExecution", currentExecution);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <Box sx={{ padding: "20px", height: "8vh", borderBottom: "solid 1px black" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ alignContent: "center" }}>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ alignContent: "center" }}>
                                <Tooltip title="Go back" variant="plain" color="neutral" sx={{ color: "#172B4D" }}>
                                    <IconButton variant="plain" onClick={handleBackClick}>
                                        <ArrowBackIosRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box>
                                <Typography
                                    level="h3"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: "18px",
                                        lineHeight: "24px",
                                        color: "#172B4D"
                                    }}
                                >
                                    Execution: {currentExecution?.title}
                                </Typography>
                                <Typography
                                    level="h4"
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: "12px",
                                        lineHeight: "20px",
                                        color: "#42526EB2"
                                    }}
                                >
                                    Created on:{" "}
                                    {new Date(currentExecution ? currentExecution.date : "").toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                disabled
                                startDecorator={<RestartAltRoundedIcon />}
                                sx={{
                                    borderColor: "primary.subtle",
                                    color: "primary.subtle",
                                    backgroundColor: "white"
                                }}
                                // onClick={handleSaveClick}
                            >
                                Reset all inputs
                            </Button>
                            <Button
                                variant="outlined"
                                disabled
                                startDecorator={<RestartAltRoundedIcon />}
                                sx={{
                                    borderColor: "primary.subtle",
                                    color: "primary.subtle",
                                    backgroundColor: "white"
                                }}
                            >
                                Reset all parameters
                            </Button>
                            <Button
                                variant="solid"
                                startDecorator={
                                    <ReactSVG
                                        src="/executeIcon.svg"
                                        style={{
                                            display: "inline-block",
                                            height: "1.2em", // Scale the icon to match the font size
                                            width: "1.2em",
                                            verticalAlign: "middle" // Ensures vertical alignment
                                        }}
                                    />
                                }
                                sx={{
                                    backgroundColor: "primary.main",
                                    border: "1px",
                                    display: "flex", // Ensures proper alignment within the button
                                    alignItems: "center", // Aligns text and icon vertically
                                    gap: "8px"
                                }}
                            >
                                Execute Workflow
                            </Button>
                        </Stack>
                        {/* <Snackbar
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    open={snackbarOpen}
                                    onClose={() => {
                                        setSnackbarOpen(false);
                                        setSnackbarMessage("");
                                    }}
                                    variant="outlined"
                                    color={snackbarColor}
                                    autoHideDuration={2000}
                                >
                                    {snackbarMessage}
                                </Snackbar> */}
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <Typography level="h3" textColor="primary.main" fontWeight="lg" mb={2}>
                    This is Execution page for id: {currentExecution?.id}
                </Typography>
            </Box>
        </Box>
    );
};

const ExecutionComponentWithErrorHandling = withErrorHandling(ExecutionComponent);
const ExecutionComponentWithLoadingAndErrorHandling = withLoading(ExecutionComponentWithErrorHandling);

const Execution = (): JSX.Element => {
    const { exId } = useParams<{ exId: string }>();
    const appDispatch = useAppDispatch();

    const currentExecution = useAppSelector((state) => state.execution.currentExecution);
    const loading = useAppSelector((state) => state.execution.loading);
    const error = useAppSelector((state) => state.execution.error);

    React.useEffect(() => {
        console.log("exId", exId);
        if (exId !== undefined && currentExecution === null) {
            appDispatch(getExecutionById(exId));
        }
    }, []);

    return (
        <ExecutionComponentWithLoadingAndErrorHandling
            currentExecution={currentExecution}
            isLoading={loading}
            error={error}
        />
    );
};

export default Execution;
