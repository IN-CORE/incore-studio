import React from "react";
import { useParams } from "react-router-dom";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import axios from "axios";

import {
    Box,
    Button,
    Divider,
    Grid,
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
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import AddIcon from "@mui/icons-material/Add";

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
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";

const SidePanel: React.FC<{ createMode: boolean }> = ({ createMode }) => {
    const appDispatch = useAppDispatch();

    const { id } = useParams<{ id: string }>();

    const sidePanelData = useAppSelector((state) => state.execution.sidePanelData);
    const project = useAppSelector((state) => state.project.project);
    const projectDataset = useAppSelector((state) => state.project.projectDatasets);
    const projectHazard = useAppSelector((state) => state.project.projectHazards);
    const projectDFR3Mapping = useAppSelector((state) => state.project.projectDFR3Mappings);

    const createExecution = useAppSelector((state) => state.execution.createExecution);

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

    const getInitialParametersState = (): { [key: string]: string } => {
        let initialState: { [key: string]: string } = {};
        sidePanelData.currentAnalysis.inputParameters.forEach((inputParameter) => {
            initialState[inputParameter.execFileEntryId] =
                createExecution.parameters[inputParameter.execFileEntryId] ?? inputParameter.value;
            if (inputParameter.label.includes("Service")) {
                initialState[inputParameter.execFileEntryId] = config.hostname;
            }
        });
        return initialState;
    };

    const [projectDatasetOptions, setProjectDatasetOptions] = React.useState<JSX.Element[] | null>(null);
    const [projectHazardOptions, setProjectHazardOptions] = React.useState<JSX.Element[] | null>(null);
    const [projectDFR3MappingOptions, setProjectDFR3MappingOptions] = React.useState<JSX.Element[] | null>(null);

    React.useEffect(() => {
        if (project === null && id) {
            appDispatch(getProject(id));
        } else {
            setProjectDatasetOptions(
                projectDataset.map((dataset) => (
                    <Option key={dataset.id} value={dataset.id}>
                        {dataset.title}
                    </Option>
                ))
            );
            setProjectHazardOptions(
                projectHazard.map((hazard) => (
                    <Option key={hazard.id} value={hazard.id}>
                        {hazard.name}
                    </Option>
                ))
            );
            setProjectDFR3MappingOptions(
                projectDFR3Mapping.map((dfr3Mapping) => (
                    <Option key={dfr3Mapping.id} value={dfr3Mapping.id}>
                        {dfr3Mapping.name}
                    </Option>
                ))
            );
        }
    }, [project, projectDataset, projectHazard, projectDFR3Mapping]);

    const [datasetSelect, setDatasetSelect] = React.useState<{ [key: string]: string }>(getInputDatasetInitialState());
    const [parameters, setParameters] = React.useState<{ [key: string]: string }>(getInitialParametersState());

    React.useEffect(() => {
        setDatasetSelect(getInputDatasetInitialState());
        setParameters(getInitialParametersState());
    }, [sidePanelData, createExecution]);

    const updateParameter = (execFileEntryId: string, value: string) => {
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
        console.log(resource);
        appDispatch(addDFR3MappingToProject({ projectId, dfr3Mappings: [resource] }));
        setOpenAddDFR3MappingFromServiceDialog(false);
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
                    </TabList>

                    <TabPanel sx={{ padding: "24px" }} value={0}>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                let actualDatasets: { [key: string]: string } = {};
                                let actualParameters: { [key: string]: string } = {};
                                sidePanelData.currentAnalysis.inputDatasets.forEach((inputDataset) => {
                                    if (inputDataset.fromExisting === null) {
                                        if (
                                            inputDataset.label.includes("Hazard") ||
                                            inputDataset.label.includes("DFR3")
                                        ) {
                                            actualParameters[inputDataset.execFileEntryId] =
                                                datasetSelect[inputDataset.execFileEntryId];
                                        } else {
                                            actualDatasets[inputDataset.execFileEntryId] =
                                                datasetSelect[inputDataset.execFileEntryId];
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
                            {sidePanelData.currentAnalysis.inputDatasets.length > 0 && (
                                <Box mb={4}>
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
                                        Input Datasets
                                    </Typography>
                                    <Stack direction="column" spacing={2}>
                                        {sidePanelData.currentAnalysis.inputDatasets.map((inputDataset) => (
                                            <Box key={inputDataset.execFileEntryId}>
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
                                                                    // add logic to handle dataset, hazard and dfr3 selections
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
                                                                    ? projectHazardOptions
                                                                    : inputDataset.label.includes("DFR3")
                                                                      ? projectDFR3MappingOptions
                                                                      : projectDatasetOptions}
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
                                                                              : setOpenAddDatasetFromServiceDialog(
                                                                                    true
                                                                                );
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
                                        Input Parameters
                                    </Typography>
                                    <Stack direction="column" spacing={2}>
                                        {sidePanelData.currentAnalysis.inputParameters.map((inputParameter) => (
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
                                                <Input
                                                    disabled={!createMode}
                                                    value={parameters[inputParameter.execFileEntryId]}
                                                    name={inputParameter.execFileEntryId}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (
                                                            inputParameter.label !== "Analysis" &&
                                                            !inputParameter.label.includes("Service")
                                                        ) {
                                                            updateParameter(
                                                                inputParameter.execFileEntryId,
                                                                e.target.value
                                                            );
                                                        }
                                                    }}
                                                    variant={createMode ? "outlined" : "solid"}
                                                    sx={{
                                                        "&.Mui-disabled": {
                                                            color: "#1E293B"
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
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
                                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
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
                                        <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                                            <Grid xs={10} component="div">
                                                <Input
                                                    disabled
                                                    value={outputDataset.datasetId}
                                                    variant="solid"
                                                    sx={{
                                                        "&.Mui-disabled": {
                                                            color: "#1E293B"
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid xs={1} component="div">
                                                <Tooltip title="Add to Visualization" placement="bottom">
                                                    <IconButton>
                                                        <BookmarkAddRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                            <Grid xs={1} component="div">
                                                <Tooltip title="Download file" placement="bottom">
                                                    <IconButton onClick={() => downloadFile(outputDataset.datasetId)}>
                                                        <FileDownloadRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </TabPanel>
                </Tabs>
            </Stack>
        </Sheet>
    );
};

export default SidePanel;
