import React from "react";
import MapIcon from "/public/map.png";

export const MapThumbnail = () => {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20
            }}
        >
            <img src={MapIcon} alt="map" style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
