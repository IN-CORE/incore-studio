import React, { useState, useEffect } from "react";
import { getGeoServerImageUrlAsDataUrl } from "@app/utils";
import { Box, Typography } from "@mui/material";

export const MapThumbnail = ({ id }: { id: string }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the image for the first hazard dataset
        async function fetchImage() {
            const dataUrl = await getGeoServerImageUrlAsDataUrl(id, 200, 200);
            setImageSrc(dataUrl); // Set the image source once it's ready
        }

        fetchImage(); // Call the async function
    }, [id]); // This effect will run when the hazard prop changes

    return (
        <>
            {imageSrc ? (
                <img src={imageSrc} alt="Hazard" style={{ height: 200, width: "100%" }} />
            ) : (
                <Box
                    sx={{
                        height: 200,
                        backgroundColor: "#e0e0e0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Typography level="body-sm">Loading...</Typography>
                </Box>
            )}
        </>
    );
};
