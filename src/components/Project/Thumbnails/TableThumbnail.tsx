import React from "react";
import TableIcon from "/public/table.png";

export const TableThumbnail = () => {
    return (
        <div
            style={{
                height: 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <img src={TableIcon} alt="table" style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
