import React, { useState, useEffect } from "react";
import { getGeoServerImageUrlAsDataUrl } from "@app/utils";

export const MapThumbnail = ({ hazard }: { hazard: Hazard }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the image for the first hazard dataset
        async function fetchImage() {
            if (hazard?.hazardDatasets && hazard.hazardDatasets.length > 0) {
                const datasetId = hazard.hazardDatasets[0].datasetId;
                const dataUrl = await getGeoServerImageUrlAsDataUrl(datasetId, 200, 200);
                setImageSrc(dataUrl); // Set the image source once it's ready
            }
        }

        fetchImage(); // Call the async function
    }, [hazard]); // This effect will run when the hazard prop changes

    return (
        <>
            {imageSrc ? (
                <img src={imageSrc} alt="Hazard" style={{ height: 200, width: "100%" }} />
            ) : (
                <p>Loading image...</p> // Show loading state while the image is being fetched
            )}
        </>
    );
};
