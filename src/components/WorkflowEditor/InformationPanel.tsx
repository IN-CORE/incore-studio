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
                        fontWeight: 590,
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
                    <TrendingUpRoundedIcon sx={{ color: "#EF6C00", marginRight: "10px" }} />
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
                        level="body-lg"
                        sx={{
                            color: "#172B4D"
                        }}
                    >
                        {currentTool ? currentTool?.description : "No Description available."}
                    </Typography>
                </Box>
                <Box>
                    <Stack spacing={0} direction="row" alignItems="center">
                        <StorageIcon
                            sx={{
                                color: "#007DFF",
                                marginRight: "5px",
                                fontSize: "15px"
                            }}
                        />
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Inputs
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.inputs.map((input) => {
                                if (input.title !== "stdout") {
                                    return (
                                        <ListItem key={input.title}>
                                            <Stack
                                                direction={"row"}
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
                                                </Typography>
                                                <Typography
                                                    level="body-sm"
                                                    sx={{
                                                        color: "red"
                                                    }}
                                                >
                                                    {input.allowNull ? "Optional" : "Required"}
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
                                        <ListItem key={parameter.title}>
                                            <Stack
                                                direction={"row"}
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
                                                </Typography>
                                                <Typography
                                                    level="body-sm"
                                                    sx={{
                                                        color: "red"
                                                    }}
                                                >
                                                    {parameter.allowNull ? "Optional" : "Required"}
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
                <Box>
                    <Stack spacing={0} direction="row" alignItems="center">
                        <StorageIcon
                            sx={{
                                color: "#AB47BC",
                                marginRight: "5px",
                                fontSize: "15px"
                            }}
                        />
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Outputs
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.outputs.map((output) => {
                                if (output.title !== "stdout") {
                                    return (
                                        <ListItem key={output.title}>
                                            <Stack
                                                direction={"row"}
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
                <Box>
                    <Stack spacing={0} direction="row" alignItems="center">
                        <TuneRoundedIcon
                            sx={{
                                color: "#EF6C00",
                                marginRight: "5px",
                                fontSize: "15px"
                            }}
                        />
                        <Typography level="title-lg" sx={{ color: "#172B4D" }}>
                            Parameters
                        </Typography>
                    </Stack>
                    <Box sx={{ padding: "5px" }}>
                        <List marker="disc">
                            {currentTool?.parameters.map((parameter) => {
                                if (parameter.title !== "hazard_id" && parameter.title !== "dfr3_mapping_set") {
                                    return (
                                        <ListItem key={parameter.title}>
                                            <Stack
                                                direction={"row"}
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
                                                </Typography>
                                                <Typography
                                                    level="body-sm"
                                                    sx={{
                                                        color: "red"
                                                    }}
                                                >
                                                    {parameter.allowNull ? "Optional" : "Required"}
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
