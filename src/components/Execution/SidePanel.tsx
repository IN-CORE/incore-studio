import React from "react";
import { useParams } from "react-router-dom";
import config from "@app/app.config";

import {
    Box,
    Button,
    Divider,
    IconButton,
    Input,
    Option,
    Select,
    Sheet,
    Stack,
    Tab,
    Tabs,
    TabList,
    tabClasses,
    TabPanel,
    Typography,
    Tooltip
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StorageIcon from "@mui/icons-material/Storage";
import AddIcon from "@mui/icons-material/Add";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useShallow } from "zustand/react/shallow";

import {
    updateCreateExecutionTemplateDatasetAndParams,
    updateExecutionSidePanelCheckStatus,
    clearSidePanelData
} from "@app/reducer/executionSlice";
import {
    addDatasetToProject,
    addDFR3MappingToProject,
    addHazardToProject,
    getProject
} from "@app/reducer/projectSlice";

import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import { extractStatus } from "@app/utils";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";
import CompatibleTypeTooltip from "./CompatibleTypeTooltip";
import OutputFileDisplay from "./OutputFileDisplay";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    setNodes: state.setNodes
});

const getInitialParametersState = (
    sidePanelData: ExecutionSidePandelData,
    dependencyGraph: DependencyGraph | null,
    createExecution: ExecutionCreate,
    createMode = false
): { [key: string]: string | boolean } => {
    const initialState: { [key: string]: string | boolean } = {};
    sidePanelData.currentAnalysis.inputParameters.forEach((inputParameter) => {
        initialState[inputParameter.execFileEntryId] =
            createExecution.parameters[inputParameter.execFileEntryId] ?? inputParameter.value;
        if (
            dependencyGraph &&
            dependencyGraph[sidePanelData.currentAnalysis.depGName].parameter_defaults[inputParameter.label] !==
                undefined &&
            createMode
        ) {
            if (inputParameter.type === "boolean") {
                initialState[inputParameter.execFileEntryId] =
                    dependencyGraph[sidePanelData.currentAnalysis.depGName].parameter_defaults[inputParameter.label] ===
                    "true";
            } else {
                initialState[inputParameter.execFileEntryId] =
                    dependencyGraph[sidePanelData.currentAnalysis.depGName].parameter_defaults[inputParameter.label];
            }
        }
        if (inputParameter.label.includes("Service")) {
            initialState[inputParameter.execFileEntryId] = config.hostname;
        }
    });
    return initialState;
};

const SidePanel: React.FC<{ createMode: boolean }> = ({ createMode }) => {
    const appDispatch = useAppDispatch();

    const { id } = useParams<{ id: string }>();
    const { setNodes, nodes } = useStore(useShallow(selector));

    const sidePanelData = useAppSelector((state) => state.execution.sidePanelData);
    const project = useAppSelector((state) => state.project.project);
    const projectDataset = useAppSelector((state) => state.project.projectDatasets);
    const projectHazard = useAppSelector((state) => state.project.projectHazards);
    const projectDFR3Mapping = useAppSelector((state) => state.project.projectDFR3Mappings);
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    const currentExecution = useAppSelector((state) => state.execution.currentExecution);

    const createExecution = useAppSelector((state) => state.execution.createExecution);

    const getInputDatasetInitialState = (): { [key: string]: string } => {
        const initialState: { [key: string]: string } = {};
        sidePanelData.currentAnalysis.inputDatasets.forEach((inputDataset) => {
            if (inputDataset.fromExisting === null) {
                if (inputDataset.label.includes("Hazard") || inputDataset.label.includes("DFR3")) {
                    initialState[inputDataset.execFileEntryId] =
                        createExecution.parameters[inputDataset.execFileEntryId] ?? "";
                } else {
                    initialState[inputDataset.execFileEntryId] =
                        createExecution.datasets[inputDataset.execFileEntryId] ?? "";
                }
            }
        });
        return initialState;
    };

    const [options, setOptions] = React.useState<{
        projectDatasetOptions: JSX.Element[];
        projectHazardOptions: JSX.Element[];
        projectDFR3MappingOptions: JSX.Element[];
    } | null>(null);

    React.useEffect(() => {
        if (project === null && id) {
            appDispatch(getProject(id));
        } else {
            let projectDatasetOptions: JSX.Element[] = [];
            let projectHazardOptions: JSX.Element[] = [];
            let projectDFR3MappingOptions: JSX.Element[] = [];
            if (projectDataset && projectHazard && projectDFR3Mapping) {
                projectDatasetOptions = projectDataset.map((dataset) => (
                    <Option key={`${dataset.id}|${dataset.dataType}`} value={dataset.id}>
                        {dataset.title}
                    </Option>
                ));
                projectHazardOptions = projectHazard.map((hazard) => (
                    <Option key={`${hazard.id}|${hazard.type}`} value={hazard.id}>
                        {hazard.name}
                    </Option>
                ));
                projectDFR3MappingOptions = projectDFR3Mapping.map((dfr3Mapping) => (
                    <Option key={`${dfr3Mapping.id}|${dfr3Mapping.hazardType}`} value={dfr3Mapping.id}>
                        {dfr3Mapping.name}
                    </Option>
                ));
            }
            setOptions({ projectDatasetOptions, projectHazardOptions, projectDFR3MappingOptions });
        }
    }, [project, projectDataset, projectHazard, projectDFR3Mapping]);

    const [datasetSelect, setDatasetSelect] = React.useState<{ [key: string]: string } | null>(null);
    const [parameters, setParameters] = React.useState<{ [key: string]: string | boolean | null }>(
        getInitialParametersState(sidePanelData, dependencyGraph, createExecution, createMode)
    );
    const [selectedHazardType, setSelectedHazardType] = React.useState<string | null>(null);
    const [selectedDFR3HazardType, setSelectedDFR3HazardType] = React.useState<string | null>(null);
    const [selectedDFR3MappingType, setSelectedDFR3MappingType] = React.useState<string | null>(null);

    React.useEffect(() => {
        setDatasetSelect(getInputDatasetInitialState());
        setParameters(getInitialParametersState(sidePanelData, dependencyGraph, createExecution, createMode));
    }, [sidePanelData, createExecution, dependencyGraph]);

    const handleResetDatasets = () => {
        setDatasetSelect(getInputDatasetInitialState());
        setSelectedDFR3HazardType(null);
        setSelectedHazardType(null);
        setSelectedDFR3MappingType(null);
    };

    const handleResetParameters = () => {
        setParameters(getInitialParametersState(sidePanelData, dependencyGraph, createExecution, createMode));
    };

    const updateParameter = (execFileEntryId: string, value: string | boolean | null) => {
        setParameters((prev) => {
            return { ...prev, [execFileEntryId]: value };
        });
    };

    const updateDatasetSelect = (execFileEntryId: string, datasetId: string) => {
        setDatasetSelect((prev) => {
            return { ...prev, [execFileEntryId]: datasetId };
        });
    };

    const handleClose = () => {
        // clear selected node
        setNodes(nodes.map((node) => ({ ...node, selected: false })));
        appDispatch(clearSidePanelData());
    };

    // Add dataset to project from service
    const [openAddDatasetFromServiceDialog, setOpenAddDatasetFromServiceDialog] = React.useState(false);
    const addDatasetFunc = (projectId: string, resource: Dataset) => {
        appDispatch(addDatasetToProject({ projectId, datasets: [resource] }));
        setOpenAddDatasetFromServiceDialog(false);
    };

    // Add hazard to project from service
    const [openAddHazardFromServiceDialog, setOpenAddHazardFromServiceDialog] = React.useState(false);
    const addHazardFunc = (projectId: string, resource: Hazard) => {
        appDispatch(addHazardToProject({ projectId, hazards: [resource] }));
        setOpenAddHazardFromServiceDialog(false);
    };

    // Add hazard to project from service
    const [openAddDFR3MappingFromServiceDialog, setOpenAddDFR3MappingFromServiceDialog] = React.useState(false);
    const addDFR3MappingFunc = (projectId: string, resource: DFR3Mapping) => {
        appDispatch(addDFR3MappingToProject({ projectId, dfr3Mappings: [resource] }));
        setOpenAddDFR3MappingFromServiceDialog(false);
    };

    const getTooltip = (inputDataset: string) => {
        if (dependencyGraph && dependencyGraph[sidePanelData.currentAnalysis.depGName]) {
            if (
                inputDataset.includes("Hazard") &&
                dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs.hazard
            ) {
                return (
                    <Tooltip
                        title={
                            <CompatibleTypeTooltip
                                compatibleTypes={dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs.hazard}
                            />
                        }
                        placement="right"
                        sx={{ backgroundColor: "white" }}
                    >
                        <HelpOutlineRoundedIcon sx={{ fontSize: "18px" }} />
                    </Tooltip>
                );
            }
            if (
                inputDataset.includes("DFR3") &&
                dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs.dfr3_mapping_set
            ) {
                return (
                    <Tooltip
                        title={
                            <CompatibleTypeTooltip
                                compatibleTypes={
                                    dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs.dfr3_mapping_set
                                }
                            />
                        }
                        placement="right"
                        sx={{ backgroundColor: "white" }}
                    >
                        <HelpOutlineRoundedIcon sx={{ fontSize: "18px" }} />
                    </Tooltip>
                );
            }
            if (dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs[inputDataset]) {
                return (
                    <Tooltip
                        title={
                            <CompatibleTypeTooltip
                                compatibleTypes={
                                    dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs[inputDataset]
                                }
                            />
                        }
                        placement="right"
                        sx={{ backgroundColor: "white" }}
                    >
                        <HelpOutlineRoundedIcon sx={{ fontSize: "18px" }} />
                    </Tooltip>
                );
            }
        }
        return null;
    };

    if (!sidePanelData.open) {
        return null;
    }

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
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="24px">
                <Typography
                    level="h3"
                    sx={{
                        fontWeight: 700,
                        fontSize: "20px",
                        lineHeight: "24px",
                        color: "#172B4D"
                    }}
                >
                    {sidePanelData.currentAnalysis.name}
                </Typography>
                <Tooltip title="Close" placement="top">
                    <IconButton onClick={handleClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Divider role="presentation" />
            {/* For adding dataset from service */}
            <AddFromServiceDialog
                projectId={id ?? ""}
                resourceType="dataset"
                open={openAddDatasetFromServiceDialog}
                onClose={() => {
                    setOpenAddDatasetFromServiceDialog(false);
                }}
                onAddClick={addDatasetFunc}
            />
            {/* For adding Hazard from service */}
            <AddFromServiceDialog
                projectId={id ?? ""}
                resourceType="hazard"
                open={openAddHazardFromServiceDialog}
                onClose={() => {
                    setOpenAddHazardFromServiceDialog(false);
                }}
                onAddClick={addHazardFunc}
            />
            <AddFromServiceDialog
                projectId={id ?? ""}
                resourceType="DFR3 Mapping"
                open={openAddDFR3MappingFromServiceDialog}
                onClose={() => {
                    setOpenAddDFR3MappingFromServiceDialog(false);
                }}
                onAddClick={addDFR3MappingFunc}
            />
            <Stack
                direction="column"
                spacing={4}
                sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth", maxHeight: "100%" }}
            >
                <Tabs
                    variant="outlined"
                    aria-label="Config"
                    defaultValue={0}
                    sx={{ boxShadow: "sm", overflow: "auto" }}
                >
                    <TabList
                        disableUnderline
                        sticky="top"
                        tabFlex={1}
                        sx={{
                            [`& .${tabClasses.root}`]: {
                                "fontSize": "md",
                                "fontWeight": "lg",
                                "height": "48px",
                                '&[aria-selected="true"]': {
                                    color: "#172B4D"
                                },
                                [`&.${tabClasses.focusVisible}`]: {
                                    outlineOffset: "-4px"
                                }
                            }
                        }}
                    >
                        <Tab variant="soft" sx={{ flexGrow: 1 }}>
                            Configuration
                        </Tab>
                        <Tab variant="soft" sx={{ flexGrow: 1 }} disabled={createMode}>
                            Results
                        </Tab>
                    </TabList>

                    <TabPanel sx={{ padding: "24px" }} value={0}>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const actualDatasets: { [key: string]: string } = {};
                                let actualParameters: { [key: string]: string | boolean | null } = {};
                                sidePanelData.currentAnalysis.inputDatasets.forEach((inputDataset) => {
                                    if (inputDataset.fromExisting === null) {
                                        if (
                                            inputDataset.label.includes("Hazard") ||
                                            inputDataset.label.includes("DFR3")
                                        ) {
                                            actualParameters[inputDataset.execFileEntryId] =
                                                datasetSelect?.[inputDataset.execFileEntryId] ?? "";
                                        } else {
                                            actualDatasets[inputDataset.execFileEntryId] =
                                                datasetSelect?.[inputDataset.execFileEntryId] ?? "";
                                        }
                                    }
                                });
                                actualParameters = { ...actualParameters, ...parameters };
                                appDispatch(
                                    updateCreateExecutionTemplateDatasetAndParams({
                                        datasets: actualDatasets,
                                        parameters: actualParameters
                                    })
                                );
                                appDispatch(updateExecutionSidePanelCheckStatus(sidePanelData.currentAnalysis.id));
                                setNodes(nodes.map((node) => ({ ...node, selected: false })));
                                appDispatch(clearSidePanelData());
                            }}
                        >
                            {sidePanelData.currentAnalysis.inputDatasets.length > 0 && datasetSelect !== null && (
                                <Box mb={4}>
                                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                                        <Typography
                                            level="h4"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: "20px",
                                                lineHeight: "24px",
                                                paragraph: "28px",
                                                color: "#172B4D",
                                                letter: "5%",
                                                textTransform: "uppercase",
                                                mb: "10px"
                                            }}
                                        >
                                            Input Datasets
                                        </Typography>
                                        {createMode && (
                                            <Tooltip title="Reset datasets" placement="right">
                                                <IconButton onClick={handleResetDatasets} aria-label="Reset datasets">
                                                    <RestartAltRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                    <Stack direction="column" spacing={4}>
                                        {sidePanelData.currentAnalysis.inputDatasets.map((inputDataset) => (
                                            <Box key={inputDataset.execFileEntryId}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    mb={1}
                                                >
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography
                                                            level="h4"
                                                            component="label"
                                                            htmlFor={`${inputDataset.label}-select`}
                                                            sx={{
                                                                display: "block",
                                                                mb: 1,
                                                                fontWeight: 400,
                                                                fontSize: "18px",
                                                                lineHeight: "24px",
                                                                paragraph: "28px",
                                                                color: "#172B4D"
                                                            }}
                                                        >
                                                            {inputDataset.label}
                                                            {inputDataset.required && createMode ? (
                                                                <Typography
                                                                    component="span"
                                                                    sx={{ color: "red", marginLeft: 0.5 }}
                                                                >
                                                                    *
                                                                </Typography>
                                                            ) : null}
                                                        </Typography>
                                                        {getTooltip(inputDataset.label)}
                                                    </Stack>
                                                    {createMode && (
                                                        <Tooltip title="Add from Service" placement="top">
                                                            <IconButton
                                                                onClick={() => {
                                                                    inputDataset.label.includes("Hazard")
                                                                        ? setOpenAddHazardFromServiceDialog(true)
                                                                        : inputDataset.label.includes("DFR3")
                                                                        ? setOpenAddDFR3MappingFromServiceDialog(true)
                                                                        : setOpenAddDatasetFromServiceDialog(true);
                                                                }}
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                {inputDataset.fromExisting !== null ? (
                                                    <Input
                                                        disabled
                                                        value={`Imported from ${inputDataset.fromExisting.outputName}`}
                                                        variant="solid"
                                                        sx={{
                                                            "&.Mui-disabled": {
                                                                color: "#AB47BC",
                                                                backgroundColor: "#F3E5F5"
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box flexGrow={1}>
                                                            <Select
                                                                id={`${inputDataset.label}-select`}
                                                                disabled={!createMode}
                                                                value={
                                                                    !createMode
                                                                        ? inputDataset.datasetId
                                                                        : datasetSelect[inputDataset.execFileEntryId] ??
                                                                          ""
                                                                }
                                                                placeholder={`Select ${
                                                                    inputDataset.label.includes("Hazard")
                                                                        ? "Hazard"
                                                                        : inputDataset.label.includes("DFR3")
                                                                        ? "DFR3 Mapping"
                                                                        : "Dataset"
                                                                }`}
                                                                name={inputDataset.execFileEntryId}
                                                                required={
                                                                    inputDataset.label.includes("DFR3")
                                                                        ? false
                                                                        : inputDataset.required
                                                                }
                                                                onChange={(
                                                                    _e: React.SyntheticEvent | null,
                                                                    value: string | null
                                                                ) => {
                                                                    // add hazards dfr3 and datasets as datasets. When submitting, we split out the datasets from hazards and dfr3mappings
                                                                    if (inputDataset.label.includes("Hazard")) {
                                                                        const pjHtype = projectHazard.find(
                                                                            (hazard) => hazard.id === value
                                                                        )?.type;
                                                                        // update hazard_type parameter in the parameters
                                                                        const hazard_type_exec_id =
                                                                            sidePanelData.currentAnalysis.inputParameters.find(
                                                                                (inpP) => inpP.label === "hazard_type"
                                                                            )?.execFileEntryId;
                                                                        updateParameter(
                                                                            hazard_type_exec_id ?? "hazard_type",
                                                                            pjHtype ?? ""
                                                                        );
                                                                        setSelectedHazardType(pjHtype ?? null);
                                                                    } else if (inputDataset.label.includes("DFR3")) {
                                                                        const pjDFR3Htype = projectDFR3Mapping.find(
                                                                            (dfr3Mapping) => dfr3Mapping.id === value
                                                                        );

                                                                        setSelectedDFR3HazardType(
                                                                            pjDFR3Htype?.hazardType ?? null
                                                                        );
                                                                        setSelectedDFR3MappingType(
                                                                            pjDFR3Htype?.mappingType ?? null
                                                                        );
                                                                    }
                                                                    updateDatasetSelect(
                                                                        inputDataset.execFileEntryId,
                                                                        value ?? ""
                                                                    );
                                                                }}
                                                            >
                                                                {!createMode && (
                                                                    <Option value={inputDataset.datasetId}>
                                                                        {inputDataset.datasetId}
                                                                    </Option>
                                                                )}
                                                                {inputDataset.label.includes("Hazard")
                                                                    ? options?.projectHazardOptions
                                                                    : inputDataset.label.includes("DFR3")
                                                                    ? options?.projectDFR3MappingOptions
                                                                    : options?.projectDatasetOptions?.filter(
                                                                          (option: JSX.Element) => {
                                                                              if (
                                                                                  dependencyGraph &&
                                                                                  dependencyGraph[
                                                                                      sidePanelData.currentAnalysis
                                                                                          .depGName
                                                                                  ] &&
                                                                                  dependencyGraph[
                                                                                      sidePanelData.currentAnalysis
                                                                                          .depGName
                                                                                  ].inputs[inputDataset.label] &&
                                                                                  option.key
                                                                              ) {
                                                                                  return dependencyGraph[
                                                                                      sidePanelData.currentAnalysis
                                                                                          .depGName
                                                                                  ].inputs[inputDataset.label].includes(
                                                                                      option.key.split("|")[1]
                                                                                  ); // show datasets that are compatible with the input
                                                                              }
                                                                              return true; // if the property is not found, show all datasets
                                                                          }
                                                                      )}
                                                            </Select>
                                                        </Box>
                                                    </Stack>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            <Divider role="presentation" sx={{ mb: 3 }} />
                            {sidePanelData.currentAnalysis.inputParameters.length > 0 && (
                                <Box>
                                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                                        <Typography
                                            level="h4"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: "20px",
                                                lineHeight: "24px",
                                                paragraph: "28px",
                                                color: "#172B4D",
                                                letter: "5%",
                                                textTransform: "uppercase",
                                                mb: "10px"
                                            }}
                                        >
                                            Input Parameters
                                        </Typography>
                                        {createMode && (
                                            <Tooltip title="Reset parameters" placement="right">
                                                <IconButton
                                                    onClick={handleResetParameters}
                                                    sx={{
                                                        "color": "primary.subtle",
                                                        "&:hover": {
                                                            backgroundColor: "primary.subtle",
                                                            color: "white"
                                                        }
                                                    }}
                                                    aria-label="Reset parameters"
                                                >
                                                    <RestartAltRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                    <Stack direction="column" spacing={4}>
                                        {sidePanelData.currentAnalysis.inputParameters.map((inputParameter) => {
                                            if (
                                                !inputParameter.hidden &&
                                                !inputParameter.label.includes("Service") &&
                                                !inputParameter.label.includes("Analysis")
                                            ) {
                                                return (
                                                    <Box key={inputParameter.execFileEntryId}>
                                                        <Typography
                                                            level="h4"
                                                            component="label"
                                                            htmlFor={`${inputParameter.label}-input`}
                                                            sx={{
                                                                display: "block",
                                                                mb: 1,
                                                                fontWeight: 400,
                                                                fontSize: "18px",
                                                                lineHeight: "24px",
                                                                paragraph: "28px",
                                                                color: "#172B4D"
                                                            }}
                                                        >
                                                            {inputParameter.label}
                                                            {inputParameter.required && createMode ? (
                                                                <Typography
                                                                    component="span"
                                                                    sx={{ color: "red", marginLeft: 0.5 }}
                                                                >
                                                                    *
                                                                </Typography>
                                                            ) : null}
                                                        </Typography>
                                                        {inputParameter.type === "BOOLEAN" ? (
                                                            <Select
                                                                disabled={!createMode}
                                                                value={
                                                                    (parameters[
                                                                        inputParameter.execFileEntryId
                                                                    ] as boolean) ?? null
                                                                }
                                                                name={inputParameter.execFileEntryId}
                                                                onChange={(_, newValue: boolean | null) => {
                                                                    if (newValue !== null) {
                                                                        updateParameter(
                                                                            inputParameter.execFileEntryId,
                                                                            newValue
                                                                        );
                                                                    }
                                                                }}
                                                                variant={createMode ? "outlined" : "solid"}
                                                                sx={{
                                                                    "&.Mui-disabled": {
                                                                        color: "#1E293B"
                                                                    }
                                                                }}
                                                                placeholder="Select true or false"
                                                            >
                                                                <Option value>True</Option>
                                                                <Option value={false}>False</Option>
                                                            </Select>
                                                        ) : (
                                                            <Input
                                                                disabled={
                                                                    !createMode ||
                                                                    inputParameter.label === "hazard_type" ||
                                                                    inputParameter.label.toLocaleLowerCase() ===
                                                                        "analysis" ||
                                                                    inputParameter.label.includes("Service")
                                                                }
                                                                value={
                                                                    (parameters?.[
                                                                        inputParameter.execFileEntryId
                                                                    ] as string) ?? ""
                                                                }
                                                                name={inputParameter.execFileEntryId}
                                                                type={inputParameter.type.toLocaleLowerCase()}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    if (
                                                                        inputParameter.label !== "Analysis" &&
                                                                        !inputParameter.label.includes("Service") &&
                                                                        /^[A-Za-z0-9 _,\-\.]*$/.test(e.target.value)
                                                                    ) {
                                                                        updateParameter(
                                                                            inputParameter.execFileEntryId,
                                                                            e.target.value
                                                                        );
                                                                    }
                                                                }}
                                                                placeholder={
                                                                    inputParameter.label === "hazard_type"
                                                                        ? (parameters?.[
                                                                              inputParameter.execFileEntryId
                                                                          ] as string)
                                                                        : undefined
                                                                }
                                                                variant={createMode ? "outlined" : "solid"}
                                                                sx={{
                                                                    "&.Mui-disabled": {
                                                                        color: "#1E293B"
                                                                    }
                                                                }}
                                                                slotProps={
                                                                    inputParameter.type === "NUMBER"
                                                                        ? {
                                                                              input: {
                                                                                  min: 0,
                                                                                  step:
                                                                                      inputParameter.label ===
                                                                                          "num_cpu" ||
                                                                                      inputParameter.label === "seed"
                                                                                          ? 1
                                                                                          : 0.01 // allows any decimal value
                                                                              }
                                                                          }
                                                                        : {}
                                                                }
                                                            />
                                                        )}
                                                    </Box>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Stack>
                                </Box>
                            )}
                            {createMode && (
                                <Box mt={4}>
                                    {/* Check if the hazardtypes match when the user clicks submit. if they dont then show some error message */}
                                    {selectedDFR3MappingType === "fragility" ? (
                                        selectedHazardType !== selectedDFR3HazardType ? (
                                            <Typography color="danger" sx={{ mb: 2 }}>
                                                The selected hazard type do not match for DFR3 Mapping and Hazard.
                                                Please ensure they are the same.
                                            </Typography>
                                        ) : null
                                    ) : null}
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        disabled={
                                            selectedDFR3MappingType === "fragility"
                                                ? selectedHazardType !== selectedDFR3HazardType
                                                : false
                                        }
                                        sx={{ backgroundColor: "primary.main", color: "white" }}
                                    >
                                        Save this configuration
                                    </Button>
                                </Box>
                            )}
                        </form>
                    </TabPanel>
                    <TabPanel value={1}>
                        {extractStatus(currentExecution) === "WAITING" ||
                        extractStatus(currentExecution) === "QUEUED" ||
                        extractStatus(currentExecution) === "RUNNING" ? (
                            <Box>
                                <Typography
                                    level="h4"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "16px",
                                        lineHeight: "24px",
                                        paragraph: "28px",
                                        color: "#172B4D",
                                        letter: "5%",
                                        textTransform: "uppercase",
                                        mb: "10px"
                                    }}
                                >
                                    Execution Status: {extractStatus(currentExecution)}
                                </Typography>
                                <Typography
                                    level="h4"
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: "14px",
                                        lineHeight: "24px",
                                        paragraph: "28px",
                                        color: "#172B4D"
                                    }}
                                >
                                    The execution is currently running. Please wait for the execution to complete.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ p: 1 }}>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
                                >
                                    <Typography
                                        level="h4"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: "20px",
                                            lineHeight: "24px",
                                            paragraph: "28px",
                                            color: "#172B4D",
                                            letter: "5%",
                                            textTransform: "uppercase",
                                            mb: "10px"
                                        }}
                                    >
                                        Output Datasets
                                    </Typography>
                                </Stack>
                                <Stack direction="column" spacing={4}>
                                    {sidePanelData.currentAnalysis.outputDatasets.map((outputDataset) => (
                                        <Box key={outputDataset.execFileEntryId}>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mb={1}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
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
                                                    <Typography
                                                        level="h4"
                                                        sx={{
                                                            display: "block",
                                                            mb: 1,
                                                            fontWeight: 400,
                                                            fontSize: "18px",
                                                            lineHeight: "24px",
                                                            paragraph: "28px",
                                                            color: "#172B4D"
                                                        }}
                                                    >
                                                        {outputDataset.label}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <OutputFileDisplay datasetId={outputDataset.datasetId} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </TabPanel>
                </Tabs>
            </Stack>
        </Sheet>
    );
};

export default SidePanel;
