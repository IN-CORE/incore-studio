import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { Box, InputAdornment, MenuItem, Select } from "@mui/material";
import React, { useMemo, useState } from "react";

import { layerTypeIcons } from "@app/utils/icons";
import { DatasetLayerItem } from "@app/components/Map/CustomDataInventory/DatasetLayerItem";
import { RootState } from "@app/store";
import { inferLayerType } from "@app/utils";
import { useSelector } from "react-redux";

export const DatasetLayerList = () => {
    const datasets = useSelector((state: RootState) => state.project.projectDatasets).filter(
        (dataset) =>
            dataset.format === "shapefile" ||
            (dataset.sourceDataset !== undefined && dataset.sourceDataset.trim() !== "")
    );
    // const datasets = incoreStudioStore
    //     .getState()
    //     .project.projectDatasets.filter(
    //         (dataset) =>
    //             dataset.format === "shapefile" ||
    //             (dataset.sourceDataset !== undefined && dataset.sourceDataset.trim() !== "")
    //     );

    const groupByOptions = ["data_type", "feature_type"];
    const [groupBy, setGroupBy] = useState("data_type");

    const datasetGroups: Record<string, Dataset[]> = useMemo(() => {
        const groups: Record<string, Dataset[]> = {};
        for (const dataset of datasets) {
            const key = groupBy === "feature_type" ? inferLayerType(dataset.dataType) : dataset.dataType;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(dataset);
        }
        return groups;
    }, [datasets, groupBy]);

    return (
        <>
            <Box mt={2} className="flex-none px-[32px]">
                <Select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    fullWidth
                    variant="standard"
                    disableUnderline
                    className="capitalize bg-[#F3F4F6] text-[14px] h-[34px] px-4 py-2 rounded-sm shadow-sm focus:bg-[#F3F4F6] hover:bg-[#F3F4F6] flex items-center"
                    startAdornment={
                        <InputAdornment className="text-gray-600 text-[14px]" position="start">
                            <FolderOpenOutlinedIcon />
                        </InputAdornment>
                    }
                >
                    {groupByOptions.map((option) => (
                        <MenuItem key={option} value={option} className="capitalize">
                            {option.replace(/_/g, " ")}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <Box className="flex-auto overflow-scroll no-scrollbar">
                {Object.entries(datasetGroups).map(([groupKey, datasets]) => (
                    <Box className="my-[20px]" key={groupKey}>
                        <Box className="flex flex-row items-center gap-[6px] text-[#13294B99] text-[11px] px-[32px] capitalize font-bold">
                            {groupBy === "feature_type" &&
                                layerTypeIcons[groupKey]?.({
                                    className: "w-5 h-5"
                                })}
                            {groupKey}
                        </Box>
                        <Box className="mt-[5px]">
                            {datasets.length > 0 ? (
                                datasets.map((dataset) => (
                                    <Box key={dataset.id} className="flex justify-center px-[32px]">
                                        <DatasetLayerItem dataset={dataset} />
                                    </Box>
                                ))
                            ) : (
                                <Box className="text-gray-400 text-sm italic px-[32px]">
                                    Datasets will be available soon...
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </>
    );
};
