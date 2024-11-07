import React from "react";
import TableIcon from "@app/public/table.png";

export const TableThumbnail = () => {
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
            <img src={TableIcon} alt="table" style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
