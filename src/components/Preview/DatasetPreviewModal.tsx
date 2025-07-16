import React from "react";
import axios from "axios";

import { Modal, ModalDialog, ModalClose, Box, Typography, Sheet, Tabs, Tab, TabList, TabPanel } from "@mui/joy";
import { GridRowsProp, GridColDef } from "@mui/x-data-grid";

import config from "@app/app.config";
import { convertGridToVegaData, getHeaders, getOidcUser, mapIncoreDatasetToGeoExplorerDataset } from "@app/utils";
import { CSVVegaChart } from "@app/components/Preview/CSVVegaChart";
import {
    addLayer,
    GeoExplorer,
    GeoExplorerConfig,
    GeoExplorerProvider,
    selectMapLayer,
    setShowLayerSettings,
    setSidebarOpen
} from "@ncsa/geo-explorer";
import DataTable from "@app/components/Preview/DataTable";

interface DatasetDatasetPreviewModalProps {
    open: boolean;
    onClose: () => void;
    dataset?: Dataset | null;
}

const parseCSV = (csvText: string): { rows: GridRowsProp; columns: GridColDef[] } => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const columns: GridColDef[] = headers.map((header, index) => ({
        field: `col${index + 1}`,
        headerName: header,
        flex: 1
    }));

    const rows: GridRowsProp = lines.slice(1).map((line, rowIndex) => {
        const values = line.split(",").map((v) => v.trim());
        // remove any double quotes
        const cleanedValues = values.map((v) => v.replace(/"/g, ""));
        // remove any leading or trailing whitespace
        const trimmedValues = cleanedValues.map((v) => v.trim());

        const row: Record<string, any> = { id: rowIndex + 1 };
        trimmedValues.forEach((val, i) => {
            if (!Number.isNaN(Number(val)) && /^\d+(\.\d+)?$/.test(val)) {
                row[`col${i + 1}`] = parseFloat(val);
            } else {
                row[`col${i + 1}`] = val;
            }
        });

        return row;
    });
    return { rows, columns };
};

const DatasetPreviewModal: React.FC<DatasetDatasetPreviewModalProps> = ({ open, onClose, dataset }) => {
    if (!dataset) {
        return null;
    }
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    const [tableData, setTableData] = React.useState<{ rows: GridRowsProp; columns: GridColDef[] }>({
        rows: [],
        columns: []
    });
    const [jsonData, setJsonData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState<number>(0);

    React.useEffect(() => {
        const getDataset = async (datasetId: string, fileId: string) => {
            const response = await axios.get(`${config.datawolfApi}/datasets/${datasetId}/${fileId}/file`, {
                headers: getHeaders()
            });
            return response.data;
        };

        if (dataset && dataset?.format === "table") {
            const datasetId = dataset?.id;
            if (dataset.fileDescriptors && dataset.fileDescriptors.length > 0) {
                const fileId = dataset.fileDescriptors[0].id;
                setLoading(true);
                getDataset(datasetId, fileId)
                    .then((data) => {
                        const { rows, columns } = parseCSV(data);
                        setTableData({ rows, columns });
                    })
                    .catch((error) => {
                        console.error("Error fetching dataset:", error);
                    });
                setLoading(false);
            }
        } else if (dataset && dataset?.format === "json") {
            const datasetId = dataset?.id;
            if (dataset.fileDescriptors && dataset.fileDescriptors.length > 0) {
                const fileId = dataset.fileDescriptors[0].id;
                setLoading(true);
                getDataset(datasetId, fileId)
                    .then((data) => {
                        // eliminate the parsing error if the entry is just an array
                        const tmpJsonData = JSON.parse(JSON.stringify({ metadata: data }));
                        setJsonData(tmpJsonData);
                    })
                    .catch((error) => {
                        console.error("Error fetching dataset:", error);
                    });
                setLoading(false);
            }
        }

        return () => {
            setTableData({ rows: [], columns: [] });
            setJsonData([]);
            setLoading(false);
            setTabIndex(0);
        };
    }, [dataset]);
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff", padding: 10, height: "100%" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {dataset?.title}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{dataset?.description}</Typography>
                    <Typography level="body-sm">
                        {new Intl.DateTimeFormat("en-US", options).format(new Date(dataset?.date))}
                    </Typography>
                </Box>
                {/* eslint-disable-next-line no-nested-ternary */}
                {dataset?.format === "table" ? (
                    <Tabs
                        value={tabIndex}
                        onChange={(_, val) => {
                            if (typeof val === "number") setTabIndex(val);
                        }}
                        sx={{ mt: 2 }}
                    >
                        <TabList>
                            <Tab
                                sx={{
                                    "&.Mui-selected": {
                                        color: "primary.main",
                                        fontWeight: "bold"
                                    }
                                }}
                            >
                                Table
                            </Tab>
                            <Tab
                                sx={{
                                    "&.Mui-selected": {
                                        color: "primary.main",
                                        fontWeight: "bold"
                                    }
                                }}
                            >
                                Chart
                            </Tab>
                        </TabList>
                        <TabPanel value={0} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                            <DataTable rows={tableData.rows} columns={tableData.columns} loading={loading} />
                        </TabPanel>
                        <TabPanel value={1}>
                            <CSVVegaChart data={convertGridToVegaData([...tableData.rows], tableData.columns)} />
                        </TabPanel>
                    </Tabs>
                ) : // eslint-disable-next-line no-nested-ternary
                dataset?.format === "json" ? (
                    <Sheet sx={{ padding: 2, overflow: "auto" }}>
                        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                    </Sheet>
                ) : dataset?.format === "shapefile" || dataset?.format === "raster" || dataset?.format === "geotif" ? (
                    <GeoExplorerProvider
                        config={
                            {
                                basemaps: [
                                    {
                                        layer_id: "OSM",
                                        display_name: "OpenStreetMap",
                                        tile_url_template: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                        thumbnail_url: "https://a.tile.openstreetmap.org/0/0/0.png"
                                    }
                                ],
                                simple_layers: [
                                    mapIncoreDatasetToGeoExplorerDataset(dataset, `${config.hostname}/geoserver`)
                                ],
                                temporal_layers: [],
                                // naive approach to center the map on the visualization bounding box
                                mapConfig: {
                                    boundingBox: dataset?.boundingBox
                                }
                            } as GeoExplorerConfig
                        }
                        accessToken={getOidcUser()?.access_token}
                        isProtectedResource={(url) => /geoserver/.test(url)}
                        components={{
                            DataInventory: () => null
                        }}
                        onReady={({ store }) => {
                            store.dispatch(addLayer({ layer_id: dataset.id }));
                            store.dispatch(selectMapLayer({ layer_id: dataset.id }));
                            store.dispatch(setShowLayerSettings({ show: true }));
                            store.dispatch(setSidebarOpen({ open: false }));
                        }}
                    >
                        <GeoExplorer key={dataset.id} />
                    </GeoExplorerProvider>
                ) : (
                    <Typography level="body-md" sx={{ padding: 2 }}>
                        {dataset?.format} is not supported for table view.
                    </Typography>
                )}
            </ModalDialog>
        </Modal>
    );
};
export default DatasetPreviewModal;
