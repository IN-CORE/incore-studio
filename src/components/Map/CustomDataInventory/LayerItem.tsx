import React from "react";
import classNames from "classnames";
import { IconButton } from "@mui/material";
import { AddCircleOutline, RemoveCircle, DescriptionOutlined } from "@mui/icons-material";

import { useSelector, useDispatch, addLayer, removeLayer, selectDataset, RootState } from "@ncsa/geo-explorer";
import { getHeaders, inferLayerType } from "@app/utils";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "@app/app.config";

export type DatasetLayerItemProps = {
    dataset: Dataset;
    visualization: Visualization;
};

export const LayerItem = ({ dataset, visualization }: DatasetLayerItemProps) => {
    const { id } = useParams<{ id: string }>();

    const geoExplorerDispatch = useDispatch();
    const mapLayers = useSelector((state: RootState) => state.explore.mapLayers);

    const isSelected = mapLayers.some((layer) => layer.data.layer_id === dataset.id);

    const handleSelect = () => geoExplorerDispatch(selectDataset({ layer_id: dataset.id }));

    const handleAdd = async () => {
        const layers = [
            {
                workspace: "incore",
                layerId: dataset.id,
                displayName: dataset.title,
                description: dataset.description,
                datasetCategoryType: dataset.dataType,
                layerType: inferLayerType(dataset.dataType),
                boundingBox: dataset.boundingBox
            }
        ];

        if (!id) {
            console.error("Project ID is not defined. Cannot add layer to visualization.");
            return;
        }

        try {
            await axios.post(`${config.projectApi}/${id}/visualizations/${visualization.id}/layers`, layers, {
                headers: getHeaders()
            });
            console.log("Layer added to visualization successfully.");
        } catch (error) {
            console.error("Failed to add layer to visualization:", error);
        }
        geoExplorerDispatch(addLayer({ layer_id: dataset.id }));
    };

    const handleRemove = async () => {
        if (!id) {
            console.error("Project ID is not defined. Cannot delete layer from visualization.");
            return;
        }

        try {
            await axios.delete(`${config.projectApi}/${id}/visualizations/${visualization.id}/layers`, {
                headers: getHeaders(),
                data: [dataset.id]
            });
            console.log("Layer deleted from visualization successfully.");
        } catch (error) {
            console.error("Failed to delete layer from visualization:", error);
        }
    };
    geoExplorerDispatch(removeLayer({ layer_id: dataset.id }));

    return (
        <div
            className={classNames(
                "group w-full flex items-center justify-between text-sm border rounded-md mb-2 transition-all",
                {
                    "bg-[#F3F4F6] text-[#2C343C8A] border-[#D1D5DB]": isSelected,
                    "text-[#2C343C] border-[#D1D5DB] hover:border-[#13294B] hover:text-[#13294B] hover:py-1":
                        !isSelected
                }
            )}
        >
            <div
                className={classNames(
                    "ml-2 capitalize transition-all overflow-hidden text-ellipsis whitespace-nowrap",
                    "group-hover:whitespace-normal group-hover:overflow-visible leading-[2em]"
                )}
            >
                {dataset.title}
            </div>

            <div className="flex items-center mr-2 space-x-1">
                <IconButton
                    size="small"
                    className={classNames("opacity-0 group-hover:opacity-100 transition-opacity", {
                        "text-[#2C343C8A]": isSelected
                    })}
                    onClick={handleSelect}
                >
                    <DescriptionOutlined />
                </IconButton>

                {isSelected ? (
                    <IconButton size="small" className="text-[#2C343C8A]" onClick={handleRemove}>
                        <RemoveCircle />
                    </IconButton>
                ) : (
                    <IconButton
                        size="small"
                        className="group-hover:opacity-100 group-hover:text-inherit"
                        onClick={handleAdd}
                    >
                        <AddCircleOutline />
                    </IconButton>
                )}
            </div>
        </div>
    );
};
