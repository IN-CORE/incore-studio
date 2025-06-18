import React from "react";
import { useParams } from "react-router-dom";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import axios from "axios";

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
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import AddIcon from "@mui/icons-material/Add";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import InsertChartOutlinedRoundedIcon from "@mui/icons-material/InsertChartOutlinedRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useShallow } from "zustand/react/shallow";

import {
    updateCreateExecutionTemplateDatasetAndParams,
    updateExecutionSidePanelCheckStatus,
    clearSidePanelData
} from "@app/reducer/executionSlice";
import { Pagination } from "@app/components/Home/Pagination";
import {
    addDatasetToProject,
    addDFR3MappingToProject,
    addHazardToProject,
    getProject,
    getProjectVisualizations
} from "@app/reducer/projectSlice";
import { VisualizationView } from "@app/components/Project/Resource/VisaualizationView";
import CompatibleTypeTooltip from "./CompatibleTypeTooltip";

import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import { extractStatus } from "@app/utils";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";
import OutputFileDisplay from "./OutputFileDisplay";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    setNodes: state.setNodes
});

const getInitialParametersState = (
    sidePanelData: ExecutionSidePandelData,
    dependencyGraph: DependencyGraph | null,
    createExecution: ExecutionCreate,
    createMode: boolean = false
): { [key: string]: string | boolean } => {
    let initialState: { [key: string]: string | boolean } = {};
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
    // const inputRef = React.useRef<HTMLInputElement>(null);

    const getInputDatasetInitialState = (): { [key: string]: string } => {
        let initialState: { [key: string]: string } = {};
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

    React.useEffect(() => {
        setDatasetSelect(getInputDatasetInitialState());
        setParameters(getInitialParametersState(sidePanelData, dependencyGraph, createExecution, createMode));
    }, [sidePanelData, createExecution, dependencyGraph]);

    const handleResetDatasets = () => {
        setDatasetSelect(getInputDatasetInitialState());
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

    // Pagination states
    const [visualizationPageNumber, setVisualizationPageNumber] = React.useState(1);
    const visualizationNextPage = () => {
        setVisualizationPageNumber((prevPage) => prevPage + 1);
    };
    const visualizationPreviousPage = () => {
        setVisualizationPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    React.useEffect(() => {
        if (id && !createMode) {
            // get all visualizations
            appDispatch(
                getProjectVisualizations({ projectId: id, skip: (visualizationPageNumber - 1) * 10, limit: 10 })
            );
        }
    }, [id, visualizationPageNumber]);

    const projectVisualizations = useAppSelector((state) => state.project.projectVisualizations);

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

    // View visualization
    const [selectedVisualization, setSelectedVisualization] = React.useState<Visualization>();
    const [openVisualziationView, setOpenVisualziationView] = React.useState(true);
    const handleCloseVisualziationView = () => {
        setOpenVisualziationView(false);
    };

    const downloadFile = async (datasetId: string) => {
        if (datasetId !== "") {
            try {
                const api = `${config.dataService}/${datasetId}/blob`;
                const response = await axios.get(api, { headers: getHeaders(), responseType: "blob" });
                // Create a URL for the Blob
                const url = window.URL.createObjectURL(new Blob([response.data]));

                // Create a temporary anchor element to download the file
                const a = document.createElement("a");
                a.href = url;
                a.download = `${datasetId}.zip`; // Name of the downloaded file
                document.body.appendChild(a);
                a.click();

                // Clean up the URL object
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Error downloading the file:", error);
            }
        }
    };

    const getTooltip = (inputDataset: string) => {
        if (dependencyGraph && dependencyGraph[sidePanelData.currentAnalysis.depGName]) {
            if (
                inputDataset.includes("Hazard") &&
                dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs["hazard"]
            ) {
                return (
                    <Tooltip
                        title={
                            <CompatibleTypeTooltip
                                compatibleTypes={
                                    dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs["hazard"]
                                }
                            />
                        }
                        placement="right"
                        sx={{ backgroundColor: "white" }}
                    >
                        <IconButton size="sm">
                            <InfoRoundedIcon />
                        </IconButton>
                    </Tooltip>
                );
            } else if (
                inputDataset.includes("DFR3") &&
                dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs["dfr3_mapping_set"]
            ) {
                return (
                    <Tooltip
                        title={
                            <CompatibleTypeTooltip
                                compatibleTypes={
                                    dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs["dfr3_mapping_set"]
                                }
                            />
                        }
                        placement="right"
                        sx={{ backgroundColor: "white" }}
                    >
                        <IconButton size="sm">
                            <InfoRoundedIcon />
                        </IconButton>
                    </Tooltip>
                );
            } else if (dependencyGraph[sidePanelData.currentAnalysis.depGName].inputs[inputDataset]) {
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
                        <IconButton size="sm">
                            <InfoRoundedIcon />
                        </IconButton>
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
                                fontSize: "md",
                                fontWeight: "lg",
                                height: "48px",
                                [`&[aria-selected="true"]`]: {
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
                        <Tab variant="soft" sx={{ flexGrow: 1 }} disabled={createMode}>
                            Visualizations
                        </Tab>
                    </TabList>

                    <TabPanel sx={{ padding: "24px" }} value={0}>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                let actualDatasets: { [key: string]: string } = {};
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
                                appDispatch(clearSidePanelData());
                            }}
                        >
                            {sidePanelData.currentAnalysis.inputDatasets.length > 0 && datasetSelect !== null && (
                                <Box mb={4}>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ justifyContent: "space-between", alignItems: "center", mb: "10px" }}
                                    >
                                        <Typography
                                            level="h4"
                                            sx={{
                                                fontWeight: 590,
                                                fontSize: "18px",
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
                                            <Button
                                                variant="outlined"
                                                startDecorator={<RestartAltRoundedIcon />}
                                                sx={{
                                                    borderColor: "primary.subtle",
                                                    color: "primary.subtle",
                                                    backgroundColor: "white"
                                                }}
                                                onClick={handleResetDatasets}
                                            >
                                                Reset datasets
                                            </Button>
                                        )}
                                    </Stack>
                                    <Stack direction="column" spacing={2}>
                                        {sidePanelData.currentAnalysis.inputDatasets.map((inputDataset) => (
                                            <Box key={inputDataset.execFileEntryId}>
                                                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                                    {inputDataset.required ? (
                                                        <Typography
                                                            level="h4"
                                                            component="label"
                                                            htmlFor={`${inputDataset.label}-select`}
                                                            sx={{
                                                                display: "block",
                                                                mb: 1,
                                                                fontWeight: 400,
                                                                fontSize: "14px",
                                                                lineHeight: "24px",
                                                                paragraph: "28px",
                                                                color: "#172B4D"
                                                            }}
                                                        >
                                                            {inputDataset.label}
                                                            <Typography
                                                                component="span"
                                                                sx={{ color: "red", marginLeft: 0.5 }}
                                                            >
                                                                *
                                                            </Typography>
                                                        </Typography>
                                                    ) : (
                                                        <Typography
                                                            level="h4"
                                                            sx={{
                                                                display: "block",
                                                                mb: 1,
                                                                fontWeight: 400,
                                                                fontSize: "14px",
                                                                lineHeight: "24px",
                                                                paragraph: "28px",
                                                                color: "#172B4D"
                                                            }}
                                                        >
                                                            {inputDataset.label}
                                                        </Typography>
                                                    )}
                                                    {getTooltip(inputDataset.label)}
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
                                                                        let pjHtype = projectHazard.find(
                                                                            (hazard) => hazard.id === value
                                                                        )?.type;
                                                                        // update hazard_type parameter in the parameters
                                                                        let hazard_type_exec_id =
                                                                            sidePanelData.currentAnalysis.inputParameters.find(
                                                                                (inpP) => inpP.label === "hazard_type"
                                                                            )?.execFileEntryId;
                                                                        updateParameter(
                                                                            hazard_type_exec_id ?? "hazard_type",
                                                                            pjHtype ?? ""
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
                                                        {createMode && (
                                                            <Tooltip title="Add from Service" placement="bottom">
                                                                <IconButton
                                                                    onClick={() => {
                                                                        inputDataset.label.includes("Hazard")
                                                                            ? setOpenAddHazardFromServiceDialog(true)
                                                                            : inputDataset.label.includes("DFR3")
                                                                            ? setOpenAddDFR3MappingFromServiceDialog(
                                                                                  true
                                                                              )
                                                                            : setOpenAddDatasetFromServiceDialog(true);
                                                                    }}
                                                                >
                                                                    <AddIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {sidePanelData.currentAnalysis.inputParameters.length > 0 && (
                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ justifyContent: "space-between", alignItems: "center", mb: "10px" }}
                                    >
                                        <Typography
                                            level="h4"
                                            sx={{
                                                fontWeight: 590,
                                                fontSize: "18px",
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
                                            <Button
                                                variant="outlined"
                                                startDecorator={<RestartAltRoundedIcon />}
                                                sx={{
                                                    borderColor: "primary.subtle",
                                                    color: "primary.subtle",
                                                    backgroundColor: "white"
                                                }}
                                                onClick={handleResetParameters}
                                            >
                                                Reset parameters
                                            </Button>
                                        )}
                                    </Stack>
                                    <Stack direction="column" spacing={2}>
                                        {sidePanelData.currentAnalysis.inputParameters.map((inputParameter) => {
                                            if (!inputParameter.hidden) {
                                                return (
                                                    <Box key={inputParameter.execFileEntryId}>
                                                        {inputParameter.required ? (
                                                            <Typography
                                                                level="h4"
                                                                component="label"
                                                                htmlFor={`${inputParameter.label}-input`}
                                                                sx={{
                                                                    display: "block",
                                                                    mb: 1,
                                                                    fontWeight: 400,
                                                                    fontSize: "14px",
                                                                    lineHeight: "24px",
                                                                    paragraph: "28px",
                                                                    color: "#172B4D"
                                                                }}
                                                            >
                                                                {inputParameter.label}
                                                                <Typography
                                                                    component="span"
                                                                    sx={{ color: "red", marginLeft: 0.5 }}
                                                                >
                                                                    *
                                                                </Typography>
                                                            </Typography>
                                                        ) : (
                                                            <Typography
                                                                level="h4"
                                                                sx={{
                                                                    display: "block",
                                                                    mb: 1,
                                                                    fontWeight: 400,
                                                                    fontSize: "14px",
                                                                    lineHeight: "24px",
                                                                    paragraph: "28px",
                                                                    color: "#172B4D"
                                                                }}
                                                            >
                                                                {inputParameter.label}
                                                            </Typography>
                                                        )}
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
                                                                <Option value={true}>True</Option>
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
                                    <Button
                                        type="submit"
                                        variant="solid"
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
                                        fontWeight: 590,
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
                            <Box>
                                <Typography
                                    level="h4"
                                    sx={{
                                        fontWeight: 590,
                                        fontSize: "16px",
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
                                <Stack direction="column" spacing={2}>
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
                                                    <StorageIcon
                                                        sx={{
                                                            color: "#AB47BC",
                                                            marginRight: "5px",
                                                            pointerEvents: "none",
                                                            fontSize: "15px"
                                                        }}
                                                    />
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
                                                        {outputDataset.label}
                                                    </Typography>
                                                </Stack>
                                                <Box>
                                                    <Tooltip title="Download file" placement="top-start">
                                                        <IconButton
                                                            aria-label="Download file"
                                                            onClick={() => downloadFile(outputDataset.datasetId)}
                                                        >
                                                            <FileDownloadRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Stack>
                                            <OutputFileDisplay datasetId={outputDataset.datasetId} projectId={id} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </TabPanel>
                    <TabPanel value={2}>
                        <Box>
                            <Typography
                                level="h4"
                                sx={{
                                    fontWeight: 590,
                                    fontSize: "16px",
                                    lineHeight: "24px",
                                    paragraph: "28px",
                                    color: "#172B4D",
                                    letter: "5%",
                                    textTransform: "uppercase",
                                    mb: "5px"
                                }}
                            >
                                Visualizations
                            </Typography>
                            <Typography
                                level="h4"
                                sx={{
                                    fontWeight: 400,
                                    fontSize: "12px",
                                    lineHeight: "20px",
                                    color: "#42526EB2",
                                    mb: "10px"
                                }}
                            >
                                All available visualizations in this project.
                            </Typography>
                            <Stack direction="column" spacing={2}>
                                {projectVisualizations.length === 0 ? (
                                    <Typography>No visualizations available</Typography>
                                ) : (
                                    projectVisualizations.map((visualization) => (
                                        <Box key={visualization.id}>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mb={1}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <InsertChartOutlinedRoundedIcon
                                                        sx={{
                                                            color: "#AB47BC",
                                                            marginRight: "5px",
                                                            pointerEvents: "none"
                                                        }}
                                                    />
                                                    <Typography
                                                        level="body-sm"
                                                        sx={{
                                                            fontWeight: 400,
                                                            fontSize: "16px",
                                                            lineHeight: "24px",
                                                            paragraph: "28px",
                                                            color: "#172B4D"
                                                        }}
                                                    >
                                                        {visualization.name}
                                                    </Typography>
                                                </Stack>
                                                <Box>
                                                    <Tooltip title="View visualization" placement="top-start">
                                                        <IconButton
                                                            aria-label="View visualization"
                                                            onClick={() => {
                                                                setSelectedVisualization(visualization);
                                                                setOpenVisualziationView(true);
                                                            }}
                                                        >
                                                            <VisibilityRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Stack>
                                            {selectedVisualization && (
                                                <VisualizationView
                                                    visualization={selectedVisualization}
                                                    open={openVisualziationView}
                                                    onClose={handleCloseVisualziationView}
                                                />
                                            )}
                                        </Box>
                                    ))
                                )}
                                {projectVisualizations.length > 0 && (
                                    <Box mt={4} display="flex" justifyContent="center">
                                        <Pagination
                                            pageNumber={visualizationPageNumber}
                                            dataLength={projectVisualizations.length}
                                            dataPerPage={10}
                                            previous={visualizationPreviousPage}
                                            next={visualizationNextPage}
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </TabPanel>
                </Tabs>
            </Stack>
        </Sheet>
    );
};

export default SidePanel;
