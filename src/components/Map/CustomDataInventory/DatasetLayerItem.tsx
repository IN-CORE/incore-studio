import React from "react";
import classNames from "classnames";
import { IconButton } from "@mui/material";
import { AddCircleOutline, RemoveCircle, DescriptionOutlined } from "@mui/icons-material";

import {
    useSelector,
    useDispatch,
    addLayer,
    removeLayer,
    selectDataset,
    store as geoExplorerStore
} from "@ncsa/geo-explorer";

export type DatasetLayerItemProps = {
    dataset: Dataset;
};

type GeoExplorerRootState = ReturnType<typeof geoExplorerStore.getState>;

export const DatasetLayerItem = ({ dataset }: DatasetLayerItemProps) => {
    const dispatch = useDispatch();
    const mapLayers = useSelector((state: GeoExplorerRootState) => state.explore.mapLayers);

    const isSelected = mapLayers.some((layer) => layer.data.layer_id === dataset.id);

    const handleSelect = () => dispatch(selectDataset({ layer_id: dataset.id }));

    const handleAdd = () => dispatch(addLayer({ layer_id: dataset.id }));

    const handleRemove = () => dispatch(removeLayer({ layer_id: dataset.id }));

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
