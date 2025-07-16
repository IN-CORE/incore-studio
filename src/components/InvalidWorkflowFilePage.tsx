import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/joy";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";

const InvalidWorkflowFilePage: React.FC<{
    workflowError: string | null;
    createdWorkflowError: string | null;
    currentWorkflowTitle: string | undefined;
}> = ({ workflowError, createdWorkflowError, currentWorkflowTitle }) => {
    const { id, wfID } = useParams<{ wfID: string; id: string }>();
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                flexGrow: 1,
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#E0E0E0"
            }}
        >
            <Card
                variant="soft"
                sx={{
                    width: 600,
                    backgroundColor: "white",
                    textAlign: "center",
                    padding: "24px"
                }}
            >
                <Typography
                    level="title-lg"
                    sx={{
                        fontWeight: 500,
                        fontSize: "24px",
                        lineHeight: "24px",
                        paragraph: "28px",
                        my: "10px"
                    }}
                >
                    Invalid Workflow File
                </Typography>
                <CardContent>
                    <Typography
                        level="body-md"
                        sx={{
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            paragraph: "10px",
                            mb: "10px"
                        }}
                    >
                        The workflow {currentWorkflowTitle} ID: {wfID} is invalid. Please create a new workflow.
                    </Typography>
                    <Typography
                        level="body-md"
                        sx={{
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            paragraph: "10px",
                            mb: "10px"
                        }}
                    >
                        {workflowError || createdWorkflowError}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button
                        variant="solid"
                        startDecorator={<ArrowBackIosRoundedIcon />}
                        sx={{ backgroundColor: "primary.main" }}
                        onClick={() => navigate(`/project/${id}/workflows`)}
                    >
                        Back
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default InvalidWorkflowFilePage;
