import React from "react";
import DefaultIcon from "/public/unknown.png";

export const DefaultThumbnail = () => {
    return (
        <div
            style={{
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <img
                src={DefaultIcon}
                alt="default"
                style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
            />
        </div>
    );
};
