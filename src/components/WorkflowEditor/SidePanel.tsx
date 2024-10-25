import React from "react";

import { Divider, Sheet, Stack, IconButton, Tooltip, Typography } from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { clearSidePanelData } from "@app/reducer/workflowSlice";

const SidePanel = () => {
    const appDispatch = useAppDispatch();
    const sidePanelData = useAppSelector((state) => state.workflow.sidePanelData);
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);

    if (!sidePanelData.open) {
        return null;
    }

    return (
        <Sheet
            sx={{
                backgroundColor: "white",
                overflow: "auto",
                padding: 0,
                height: "100%"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="12px">
                <Typography level="h4">Configure: {sidePanelData.type} analysis</Typography>
                <Tooltip title="Close" placement="top">
                    <IconButton onClick={() => appDispatch(clearSidePanelData())}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Divider role="presentation" />
            <Stack spacing={2} padding="12px">
                <Typography level="h3">
                    {dependencyGraph !== null
                        ? dependencyGraph[sidePanelData.currentAnalysis.name].pretty_name
                        : sidePanelData.currentAnalysis.name}
                </Typography>
            </Stack>
        </Sheet>
    );
};

export default SidePanel;
