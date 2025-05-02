import React from "react";
import MapIcon from "/public/map.png";

export const MapThumbnail = () => {
    return (
        <div
            style={{
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <img src={MapIcon} alt="map" style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
