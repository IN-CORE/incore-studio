import React from "react";

import { Box, Divider, List, ListItem, IconButton, Sheet, Stack, Typography, Tooltip } from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StorageIcon from "@mui/icons-material/Storage";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { clearInformationPanelData } from "@app/reducer/workflowSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import config from "@app/app.config";

const InformationPanel = () => {
    const appDispatch = useAppDispatch();
    const informationPanelData = useAppSelector((state) => state.workflow.informationPanelData);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    const currentTool = datawolfTools.find((tool) => tool.title === informationPanelData.currentAnalysis);

    return (
        <Sheet
            sx={{
                backgroundColor: "white",
                padding: 0,
                maxHeight: "86vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="12px">
                <Typography
                    level="h4"
                    sx={{
                        fontWeight: 600,
                        fontSize: "18px",
                        lineHeight: "22px",
                        color: "#172B4D"
                    }}
                >
                    Analysis Information
                </Typography>
                <Tooltip title="Close" placement="top">
                    <IconButton onClick={() => appDispatch(clearInformationPanelData())}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Divider role="presentation" />
            <Stack
                spacing={2}
                direction="column"
                padding="12px"
                sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth", maxHeight: "100%" }}
            >
                <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <Box
                        sx={{
                            p: "1px",
                            height: "20px",
                            width: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            borderRadius: "3px",
                            backgroundColor: "#EF6C00",
                            marginRight: "10px"
                        }}
                    >
                        <TrendingUpRoundedIcon sx={{ color: "white", fontSize: "16px" }} />
                    </Box>
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 700,
                            fontSize: "20px",
                            lineHeight: "24px",
                            color: "#172B4D"
                        }}
                    >
                        {dependencyGraph !== null
                            ? dependencyGraph[informationPanelData.currentAnalysis].pretty_name
                            : informationPanelData.currentAnalysis}
                    </Typography>
                    {dependencyGraph !== null && (
                        <Tooltip title="Open Manual Page" placement="right">
                            <IconButton
                                onClick={() => {
                                    window.open(
                                        `${config.docBaseLink}/${
                                            dependencyGraph[informationPanelData.currentAnalysis].manual
                                        }`,
                                        "_blank"
                                    );
                                }}
                            >
                                <OpenInNewRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Divider role="presentation" sx={{ my: 1 }} />
                <Box sx={{ marginTop: "10px", padding: "5px" }}>
                    <Typography
                        level="title-lg"
                        sx={{
                            color: "#172B4D"
                        }}
                    >
                        Description
                    </Typography>
                    <Typography
                        level="body-md"
                        sx={{
                            color: "#172B4D",
                            display: "block",
                            width: "100%",
                            textAlign: "justify",
                            marginTop: "10px"
                        }}
                    >
                        {currentTool ? currentTool?.description : "No Description available."}
                    </Typography>
                </Box>
                <Divider role="presentation" sx={{ my: 1 }} />
                <Box>
                    <Stack spacing={1} direction="row" alignItems="center">
                        <Box
                            sx={{
                                p: "1px",
                                height: "20px",
                                width: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                                borderRadius: "3px",
                                backgroundColor: "#007DFF"
                            }}
                        >
                            <StorageIcon
                                sx={{
                                    color: "white",
                                    fontSize: "16px"
                                }}
                            />
                        </Box>
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Inputs
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.inputs.map((input) => {
                                if (input.title !== "stdout") {
                                    return (
                                        <ListItem key={input.title} sx={{ mb: 1 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={1}
                                                sx={{ marginBottom: "5px" }}
                                            >
                                                <Typography
                                                    level="title-md"
                                                    sx={{
                                                        color: "#172B4D"
                                                    }}
                                                >
                                                    {input.title}
                                                    {input.allowNull ? null : (
                                                        <Typography
                                                            component="span"
                                                            sx={{ color: "red", marginLeft: 0.5 }}
                                                        >
                                                            *
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                level="body-md"
                                                sx={{
                                                    color: "#172B4D"
                                                }}
                                            >
                                                {input.description}
                                            </Typography>
                                        </ListItem>
                                    );
                                }
                            })}
                            {currentTool?.parameters.map((parameter) => {
                                if (parameter.title === "hazard_id" || parameter.title === "dfr3_mapping_set") {
                                    return (
                                        <ListItem key={parameter.title} sx={{ mb: 1 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={1}
                                                sx={{ marginBottom: "5px" }}
                                            >
                                                <Typography
                                                    level="title-md"
                                                    sx={{
                                                        color: "#172B4D"
                                                    }}
                                                >
                                                    {parameter.title === "hazard_id" ? "Hazard" : "DFR3 Mapping"}
                                                    {parameter.allowNull ? null : (
                                                        <Typography
                                                            component="span"
                                                            sx={{ color: "red", marginLeft: 0.5 }}
                                                        >
                                                            *
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                level="body-md"
                                                sx={{
                                                    color: "#172B4D"
                                                }}
                                            >
                                                {parameter.description}
                                            </Typography>
                                        </ListItem>
                                    );
                                }
                            })}
                        </List>
                    </Box>
                </Box>
                <Divider role="presentation" sx={{ my: 1 }} />
                <Box>
                    <Stack spacing={1} direction="row" alignItems="center">
                        <Box
                            sx={{
                                p: "1px",
                                height: "20px",
                                width: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                                borderRadius: "3px",
                                backgroundColor: "#AB47BC"
                            }}
                        >
                            <StorageIcon
                                sx={{
                                    color: "white",
                                    fontSize: "16px"
                                }}
                            />
                        </Box>
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Outputs
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.outputs.map((output) => {
                                if (output.title !== "stdout") {
                                    return (
                                        <ListItem key={output.title} sx={{ mb: 1 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={1}
                                                sx={{ marginBottom: "5px" }}
                                            >
                                                <Typography
                                                    level="title-md"
                                                    sx={{
                                                        color: "#172B4D"
                                                    }}
                                                >
                                                    {output.title}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                level="body-md"
                                                sx={{
                                                    color: "#172B4D"
                                                }}
                                            >
                                                {output.description}
                                            </Typography>
                                        </ListItem>
                                    );
                                }
                            })}
                        </List>
                    </Box>
                </Box>
                <Divider role="presentation" sx={{ my: 1 }} />
                <Box>
                    <Stack spacing={1} direction="row" alignItems="center">
                        <Box
                            sx={{
                                p: "1px",
                                height: "20px",
                                width: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                                borderRadius: "3px",
                                backgroundColor: "#EF6C00"
                            }}
                        >
                            <TuneRoundedIcon
                                sx={{
                                    color: "white",
                                    fontSize: "16px"
                                }}
                            />
                        </Box>
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Parameters
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.parameters.map((parameter) => {
                                if (
                                    parameter.title !== "hazard_id" &&
                                    parameter.title !== "dfr3_mapping_set" &&
                                    parameter.title !== "Analysis" &&
                                    parameter.title !== "IN-CORE Service"
                                ) {
                                    return (
                                        <ListItem key={parameter.title} sx={{ mb: 1 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={1}
                                                sx={{ marginBottom: "5px" }}
                                            >
                                                <Typography
                                                    level="title-md"
                                                    sx={{
                                                        color: "#172B4D"
                                                    }}
                                                >
                                                    {parameter.title}
                                                    {parameter.allowNull ? null : (
                                                        <Typography
                                                            component="span"
                                                            sx={{ color: "red", marginLeft: 0.5 }}
                                                        >
                                                            *
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                level="body-md"
                                                sx={{
                                                    color: "#172B4D"
                                                }}
                                            >
                                                {parameter.description}
                                            </Typography>
                                        </ListItem>
                                    );
                                }
                            })}
                        </List>
                    </Box>
                </Box>
            </Stack>
        </Sheet>
    );
};

export default InformationPanel;
