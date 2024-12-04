import React from "react";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import axios from "axios";

import {
    Box,
    Divider,
    Grid,
    IconButton,
    Input,
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

import { toggleSidePanel } from "@app/reducer/executionSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";

const SidePanel: React.FC<{ createMode: boolean }> = ({ createMode }) => {
    const appDispatch = useAppDispatch();

    const sidePanelData = useAppSelector((state) => state.execution.sidePanelData);

    const handleClose = () => {
        appDispatch(toggleSidePanel());
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
                                                {inputDataset.label}
                                            </Typography>
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
                                                <Input
                                                    disabled
                                                    value={inputDataset.datasetId}
                                                    variant="solid"
                                                    sx={{
                                                        "&.Mui-disabled": {
                                                            color: "#1E293B"
                                                        }
                                                    }}
                                                />
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
                                                {inputParameter.label}
                                            </Typography>
                                            <Input
                                                disabled
                                                value={inputParameter.value}
                                                variant="solid"
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
