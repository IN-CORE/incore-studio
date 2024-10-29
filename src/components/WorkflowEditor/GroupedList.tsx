import React from "react";

import { Checkbox, List, ListItem, Stack, Typography } from "@mui/joy";
import StorageIcon from "@mui/icons-material/Storage";
import Done from "@mui/icons-material/Done";
import CheckboxLabel from "./CheckboxLabel";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { setHoveredAnalysis, clearHoveredAnalysis } from "@app/reducer/workflowSlice";

interface GroupedListProps {
    previous: boolean;
    existing: boolean;
    propertyName: string;
    optionsList: {
        analysisName: string;
        analysisProperty: string;
        analysisNode?: NewAnalysisNode;
        link: { from: string; to: string };
    }[];
    selectedAnalysis: {
        value: string;
        existing: boolean;
        analysisId: string | null;
    };
    nodeLink: {
        from: string;
        to: string;
    };
    setSelectedAnalysis: React.Dispatch<
        React.SetStateAction<{ value: string; existing: boolean; analysisId: string | null }>
    >;
    setNodeLink: React.Dispatch<React.SetStateAction<{ from: string; to: string }>>;
    checkEdgetoCurrHandleExists: (nodeNameLabel: string) => boolean;
    checkEdgetoTargetHandleExists: (nodeNameLabel: string, targetNode: NewAnalysisNode | undefined) => boolean;
}

const GroupedList = ({
    previous,
    existing,
    propertyName,
    optionsList,
    selectedAnalysis,
    nodeLink,
    setSelectedAnalysis,
    setNodeLink,
    checkEdgetoCurrHandleExists,
    checkEdgetoTargetHandleExists
}: GroupedListProps) => {
    const appDispatch = useAppDispatch();
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    return (
        <Stack spacing={1} direction="column" sx={{ mb: "10px" }}>
            <Stack spacing={0} direction="row" alignItems="center">
                <StorageIcon
                    sx={{
                        color: previous ? "#007DFF" : "#AB47BC",
                        marginRight: "5px",
                        fontSize: "15px"
                    }}
                />
                <Typography level="body-md" sx={{ color: "#172B4D" }}>
                    {propertyName}
                </Typography>
            </Stack>
            <List
                sx={{
                    "--List-gap": "8px",
                    "--ListItem-minHeight": "32px",
                    "--ListItem-gap": "4px"
                }}
            >
                {dependencyGraph !== null &&
                    existing &&
                    optionsList.map((option) => {
                        return (
                            <ListItem
                                key={`${option.analysisName}-${option.link.from}-${option.link.to}-${option.analysisNode?.id}`}
                                slotProps={{
                                    root: {
                                        onMouseEnter: () => appDispatch(setHoveredAnalysis(option.analysisNode?.id)),
                                        onMouseLeave: () => appDispatch(clearHoveredAnalysis())
                                    }
                                }}
                            >
                                {selectedAnalysis.value === option.analysisName &&
                                    selectedAnalysis.existing === true &&
                                    selectedAnalysis.analysisId === option.analysisNode?.id &&
                                    nodeLink.from === option.link.from &&
                                    nodeLink.to === option.link.to && (
                                        <Done
                                            color="primary"
                                            sx={{
                                                ml: -0.5,
                                                zIndex: 2,
                                                pointerEvents: "none"
                                            }}
                                        />
                                    )}
                                <Checkbox
                                    size="sm"
                                    disableIcon
                                    overlay
                                    disabled={
                                        previous
                                            ? checkEdgetoCurrHandleExists(option.link.to)
                                            : checkEdgetoTargetHandleExists(option.link.to, option.analysisNode)
                                    }
                                    label={
                                        <CheckboxLabel
                                            name={
                                                dependencyGraph[option.analysisName] !== undefined
                                                    ? dependencyGraph[option.analysisName].pretty_name
                                                    : option.analysisName
                                            }
                                            input={!previous}
                                            property={previous ? option.link.from : option.link.to}
                                            disabled={
                                                previous
                                                    ? checkEdgetoCurrHandleExists(option.link.to)
                                                    : checkEdgetoTargetHandleExists(option.link.to, option.analysisNode)
                                            }
                                        />
                                    }
                                    checked={
                                        selectedAnalysis.value === option.analysisName &&
                                        selectedAnalysis.existing === true &&
                                        selectedAnalysis.analysisId === option.analysisNode?.id &&
                                        nodeLink.from === option.link.from &&
                                        nodeLink.to === option.link.to
                                    }
                                    variant={
                                        selectedAnalysis.value === option.analysisName &&
                                        selectedAnalysis.existing === true &&
                                        selectedAnalysis.analysisId === option.analysisNode?.id &&
                                        nodeLink.from === option.link.from &&
                                        nodeLink.to === option.link.to
                                            ? "soft"
                                            : "outlined"
                                    }
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        if (event.target.checked) {
                                            setSelectedAnalysis({
                                                value: option.analysisName,
                                                existing: true,
                                                analysisId: option.analysisNode ? option.analysisNode.id : null
                                            });
                                            setNodeLink(option.link);
                                        } else {
                                            setSelectedAnalysis({ value: "", existing: false, analysisId: null });
                                            setNodeLink({ from: "", to: "" });
                                        }
                                    }}
                                    slotProps={{
                                        action: ({ checked }) => ({
                                            sx: checked
                                                ? {
                                                      border: "1px solid",
                                                      borderColor: "primary.500"
                                                  }
                                                : {}
                                        })
                                    }}
                                />
                            </ListItem>
                        );
                    })}

                {dependencyGraph !== null &&
                    !existing &&
                    optionsList.map((option) => {
                        return (
                            <ListItem key={`${option.analysisName}-${option.link.from}-${option.link.to}`}>
                                {selectedAnalysis.value === option.analysisName &&
                                    selectedAnalysis.existing === false &&
                                    nodeLink.from === option.link.from &&
                                    nodeLink.to === option.link.to && (
                                        <Done
                                            color="primary"
                                            sx={{
                                                ml: -0.5,
                                                zIndex: 2,
                                                pointerEvents: "none"
                                            }}
                                        />
                                    )}
                                <Checkbox
                                    size="sm"
                                    disableIcon
                                    overlay
                                    disabled={previous ? checkEdgetoCurrHandleExists(option.link.to) : false}
                                    label={
                                        <CheckboxLabel
                                            name={
                                                dependencyGraph[option.analysisName] !== undefined
                                                    ? dependencyGraph[option.analysisName].pretty_name
                                                    : option.analysisName
                                            }
                                            input={!previous}
                                            property={previous ? option.link.from : option.link.to}
                                            disabled={previous ? checkEdgetoCurrHandleExists(option.link.to) : false}
                                        />
                                    }
                                    checked={
                                        selectedAnalysis.value === option.analysisName &&
                                        selectedAnalysis.existing === false &&
                                        nodeLink.from === option.link.from &&
                                        nodeLink.to === option.link.to
                                    }
                                    variant={
                                        selectedAnalysis.value === option.analysisName &&
                                        selectedAnalysis.existing === false &&
                                        nodeLink.from === option.link.from &&
                                        nodeLink.to === option.link.to
                                            ? "soft"
                                            : "outlined"
                                    }
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        if (event.target.checked) {
                                            setSelectedAnalysis({
                                                value: option.analysisName,
                                                existing: false,
                                                analysisId: null
                                            });
                                            setNodeLink(option.link);
                                        } else {
                                            setSelectedAnalysis({ value: "", existing: false, analysisId: null });
                                            setNodeLink({ from: "", to: "" });
                                        }
                                    }}
                                    slotProps={{
                                        action: ({ checked }) => ({
                                            sx: checked
                                                ? {
                                                      border: "1px solid",
                                                      borderColor: "primary.500"
                                                  }
                                                : {}
                                        })
                                    }}
                                />
                            </ListItem>
                        );
                    })}
            </List>
        </Stack>
    );
};

export default GroupedList;
