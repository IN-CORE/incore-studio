import React, { useState, useEffect } from "react";
import { getGeoServerImageUrlAsDataUrl } from "@app/utils";
import { Box, Typography } from "@mui/material";

export const MapThumbnail = ({ id }: { id: string }) => {
    const [imageUrls, setImageUrls] = useState<{ basemapUrl: string; wmsUrl: string } | null>(null);

    useEffect(() => {
        async function fetchImageUrls() {
            const urls = await getGeoServerImageUrlAsDataUrl(id, 200, 200);

            if (urls && typeof urls.basemapUrl === "string" && typeof urls.wmsUrl === "string") {
                setImageUrls({
                    basemapUrl: urls.basemapUrl,
                    wmsUrl: urls.wmsUrl
                });
            } else {
                console.error("Invalid URL types:", urls);
            }
        }
        fetchImageUrls();
    }, [id]);

    return (
        <>
            {imageUrls ? (
                <div style={{ position: "relative", width: "100%", height: 200 }}>
                    {imageUrls.basemapUrl ? (
                        <img
                            src={imageUrls.basemapUrl}
                            alt="Basemap"
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 200 }}
                        />
                    ) : null}
                    {imageUrls.wmsUrl ? (
                        <img
                            src={imageUrls.wmsUrl}
                            alt="WMS Overlay"
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 200 }}
                        />
                    ) : null}
                </div>
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
