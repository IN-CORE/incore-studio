import React from "react";
import DefaultIcon from "@app/public/unknown.png";

export const DefaultThumbnail = () => {
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
            <img
                src={DefaultIcon}
                alt="default"
                style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
            />
        </div>
    );
};
