import axios from "axios";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { Box, InputAdornment, MenuItem, Select } from "@mui/material";
import React, { useMemo, useState } from "react";

import { layerTypeIcons } from "@app/utils/icons";
import { RootState } from "@app/store";
import { inferLayerType, getHeaders } from "@app/utils";
import { useSelector } from "react-redux";
import { Typography } from "@mui/joy";
import { LayerItem } from "@app/components/Map/CustomDataInventory/LayerItem";
import config from "@app/app.config";

export const HazardLayerList = () => {
    const hazards = useSelector((state: RootState) => state.project.projectHazards);

    const groupByOptions = ["hazard_type", "feature_type"];
    const [groupBy, setGroupBy] = useState("hazard_type");

    const hazardGroups: Record<string, Hazard[]> = useMemo(() => {
        const groups: Record<string, Hazard[]> = {};
        for (const hazard of hazards) {
            const key = groupBy === "feature_type" ? inferLayerType(hazard.type) : hazard.type;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(hazard);
        }
        return groups;
    }, [hazards, groupBy]);

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
                {Object.entries(hazardGroups).map(([groupKey, hazards]) => (
                    <Box className="my-[20px]" key={groupKey}>
                        <Box className="flex flex-row items-center gap-[6px] text-[#13294B99] text-[11px] px-[32px] capitalize font-bold">
                            {groupBy === "feature_type" &&
                                layerTypeIcons[groupKey]?.({
                                    className: "w-5 h-5"
                                })}
                            {groupKey}
                        </Box>
                        <Box className="mt-[5px]">
                            {hazards.length > 0 ? (
                                hazards.map((hazard) => (
                                    <>
                                        <Typography ml={4} fontSize={13} fontWeight="bold">
                                            {hazard.name}
                                        </Typography>
                                        {hazard.hazardDatasets?.map((hazardDataset) => {
                                            const [dataset, setDataset] = React.useState<any>(null);

                                            React.useEffect(() => {
                                                const fetchDataset = async () => {
                                                    try {
                                                        const response = await axios.get(
                                                            `${config.dataService}/${hazardDataset.datasetId}`,
                                                            {
                                                                headers: getHeaders()
                                                            }
                                                        );
                                                        setDataset(response.data);
                                                    } catch (err) {
                                                        console.error("Failed to fetch dataset:", err);
                                                    }
                                                };
                                                fetchDataset();
                                            }, [hazardDataset.datasetId]);

                                            return dataset ? (
                                                <Box key={dataset.id} className="flex justify-center px-[32px]">
                                                    <LayerItem dataset={dataset} />
                                                </Box>
                                            ) : null;
                                        })}
                                    </>
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
