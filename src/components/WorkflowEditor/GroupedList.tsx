import React from "react";

import { Box, Checkbox, List, ListItem, Stack, Typography } from "@mui/joy";
import StorageIcon from "@mui/icons-material/Storage";
import Done from "@mui/icons-material/Done";
import CheckboxLabel from "./CheckboxLabel";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { setHoveredAnalysis, clearHoveredAnalysis } from "@app/reducer/workflowSlice";

interface Option {
    analysisName: string;
    analysisProperty: string;
    analysisNode?: NewAnalysisNode;
    link: { from: string; to: string };
}

interface GroupedListProps {
    previous: boolean;
    existing: boolean;
    propertyName: string;
    optionsList: Option[];
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

    const groupByAnalysisName = () => {
        let grouped = new Map<string, Option[]>();
        optionsList.forEach((option) => {
            if (!grouped.has(option.analysisName)) {
                grouped.set(option.analysisName, [option]);
            } else {
                grouped.get(option.analysisName)?.push(option);
            }
        });
        return grouped;
    };

    return (
        <Stack spacing={1} direction="column" sx={{ mb: "10px" }}>
            <Stack spacing={0} direction="row" alignItems="center">
                <Box
                    sx={{
                        p: "1px",
                        height: "20px",
                        width: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        marginRight: "5px",
                        borderRadius: "3px",
                        backgroundColor: previous ? "#007DFF" : "#AB47BC"
                    }}
                >
                    <StorageIcon
                        sx={{
                            color: "white",
                            fontSize: "16px"
                        }}
                    />
                </Box>
                <Typography level="body-lg" sx={{ color: "#172B4D" }}>
                    {propertyName}
                </Typography>
            </Stack>
            {dependencyGraph !== null &&
                existing &&
                Array.from(groupByAnalysisName()).map(([key, value]) => {
                    return (
                        <Stack spacing={1} direction="column" key={key}>
                            <Typography level="body-md" sx={{ color: "#172B4D" }}>
                                {dependencyGraph[key] !== undefined ? dependencyGraph[key].pretty_name : key}
                            </Typography>
                            <List
                                sx={{
                                    "--List-gap": "8px",
                                    "--ListItem-minHeight": "32px",
                                    "--ListItem-gap": "4px"
                                }}
                            >
                                {value.map((option) => {
                                    return (
                                        <ListItem
                                            key={`${option.analysisName}-${option.link.from}-${option.link.to}-${option.analysisNode?.id}`}
                                            slotProps={{
                                                root: {
                                                    onMouseEnter: () =>
                                                        appDispatch(setHoveredAnalysis(option.analysisNode?.id)),
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
                                                        : checkEdgetoTargetHandleExists(
                                                              option.link.to,
                                                              option.analysisNode
                                                          )
                                                }
                                                label={
                                                    <CheckboxLabel
                                                        input={!previous}
                                                        property={previous ? option.link.from : option.link.to}
                                                        disabled={
                                                            previous
                                                                ? checkEdgetoCurrHandleExists(option.link.to)
                                                                : checkEdgetoTargetHandleExists(
                                                                      option.link.to,
                                                                      option.analysisNode
                                                                  )
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
                                                            analysisId: option.analysisNode
                                                                ? option.analysisNode.id
                                                                : null
                                                        });
                                                        setNodeLink(option.link);
                                                    } else {
                                                        setSelectedAnalysis({
                                                            value: "",
                                                            existing: false,
                                                            analysisId: null
                                                        });
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
                })}

            {dependencyGraph !== null &&
                !existing &&
                Array.from(groupByAnalysisName()).map(([key, value]) => {
                    return (
                        <Stack spacing={1} direction="column" key={key}>
                            <Typography level="body-md" sx={{ color: "#172B4D" }}>
                                {dependencyGraph[key] !== undefined ? dependencyGraph[key].pretty_name : key}
                            </Typography>
                            <List
                                sx={{
                                    "--List-gap": "8px",
                                    "--ListItem-minHeight": "32px",
                                    "--ListItem-gap": "4px"
                                }}
                            >
                                {value.map((option) => {
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
                                                disabled={
                                                    previous ? checkEdgetoCurrHandleExists(option.link.to) : false
                                                }
                                                label={
                                                    <CheckboxLabel
                                                        input={!previous}
                                                        property={previous ? option.link.from : option.link.to}
                                                        disabled={
                                                            previous
                                                                ? checkEdgetoCurrHandleExists(option.link.to)
                                                                : false
                                                        }
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
                                                        setSelectedAnalysis({
                                                            value: "",
                                                            existing: false,
                                                            analysisId: null
                                                        });
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
                })}
        </Stack>
    );
};

export default GroupedList;
