import React from "react";
import axios from "axios";
import { Box } from "@mui/material";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import { LayerItem } from "@app/components/Map/CustomDataInventory/LayerItem";

export const HazardDataLayerItem: React.FC<{ hazardDataset: HazardDataset }> = ({ hazardDataset }) => {
    const [dataset, setDataset] = React.useState<Dataset>();

    React.useEffect(() => {
        const fetchDataset = async () => {
            try {
                const response = await axios.get(`${config.dataService}/${hazardDataset.datasetId}`, {
                    headers: getHeaders()
                });
                setDataset(response.data);
            } catch (err) {
                console.error("Failed to fetch dataset:", err);
            }
        };
        fetchDataset();
    }, [hazardDataset.datasetId]);

    if (!dataset) return null;

    return (
        <Box key={dataset.id} className="flex justify-center px-[32px]">
            <LayerItem dataset={dataset} />
        </Box>
    );
};
