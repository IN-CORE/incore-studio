import { User } from "oidc-client";
import config from "@app/app.config";

import axios from "axios";

export function getOidcUser() {
    const oidcStorage = sessionStorage.getItem(
        `oidc.user:${config.keycloakConfig.authority}:${config.keycloakConfig.client_id}`
    );
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

export const getHeaders = () => {
    const user = getOidcUser(); // Assuming this function retrieves the user object with the access token
    const token = user?.access_token;
    const isLocalhost = config.hostname.includes("localhost");

    if (!isLocalhost) {
        return {
            Authorization: `Bearer ${token}`
        };
    }

    return {
        "x-auth-userinfo": JSON.stringify({ preferred_username: user?.profile?.preferred_username }),
        "x-auth-usergroup": JSON.stringify({ groups: user?.profile?.groups })
    };
};

export const setAuthorizationCookie = () => {
    const user = getOidcUser(); // Assuming this function retrieves the user object with the access token
    const token = user?.access_token;

    if (token) {
        const expirationTime = 60 * 60 * 24; // 1 day in seconds
        document.cookie = `Authorization=Bearer ${token}; max-age=${expirationTime}; path=/; Secure; SameSite=Strict`;
    }
};

// export function parseDateTime(dateString: string) {
//     const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//     const options = {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         timeZone
//     };
//
//     const mydate = new Date(dateString);
//
//     // @ts-ignore
//     return mydate.toLocaleString("en-US", options);
// }

export function parseDateTime(dateString: string) {
    const mydate = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true, // Ensures AM/PM format
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    return mydate.toLocaleString("en-US", options);
}

export function formatHeaderName(header: string) {
    // Break camelCase and snake_case
    const result = header
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Break camelCase
        .replace(/_/g, " ") // Replace underscores with spaces
        .toLowerCase(); // Convert to lowercase for uniformity

    // Capitalize each word
    return result.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getGeoServerImageUrl(id: string, width: number, height: number) {
    const geoserverBaseUrl = `${config.hostname}/geoserver/incore/wms`;
    const layerName = `incore:${id}`;
    const srs = "EPSG:4326"; // Projection
    return `${geoserverBaseUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&width=${width}&height=${height}&srs=${srs}&format=image/png&datasetId=${id}`;
}

export async function getGeoServerImageUrlAsDataUrl(id: string, width: number, height: number) {
    const geoserverBaseUrl = `${config.hostname}/geoserver/incore/wms`;
    const layerName = `incore:${id}`;
    const srs = "EPSG:4326"; // Projection

    // Fetch the bounding box as a string
    const boundingBox = await getBoundingBoxFromDataset(id);
    if (!boundingBox) {
        console.error("Bounding box not found.");
        return null;
    }
    const url = `${geoserverBaseUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&tiled=true&STYLES=&LAYERS=${layerName}&WIDTH=${width}&HEIGHT=${height}&SRS=${srs}&BBOX=${boundingBox.join()}`;

    // Basemap URL (e.g., OpenStreetMap Static Image)
    const basemapUrl = getOpenStreetMapUrl(boundingBox);
    try {
        // Fetch the image as binary data
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Convert binary data to a Blob, then to a Data URL
        const blob = new Blob([response.data], { type: "image/png" });
        const wmsUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return { wmsUrl, basemapUrl };
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
}

const getOpenStreetMapUrl = (boundingBox?: Array<number>) => {
    if (!boundingBox) {
        return "https://tile.openstreetmap.org/9/265/181.png";
    }
    const zoom = 9;
    const centerLon = (boundingBox[0] + boundingBox[2]) / 2; // (minX + maxX) / 2
    const centerLat = (boundingBox[1] + boundingBox[3]) / 2; // (minY + maxY) / 2

    const { x: mercatorX, y: mercatorY } = toWebMercator(centerLon, centerLat);

    // Calculate tile X and Y based on center of bounding box
    const tileX = Math.floor(((mercatorX + 20037508.34) / 40075016.68) * 2 ** zoom);
    const tileY = Math.floor(((20037508.34 - mercatorY) / 40075016.68) * 2 ** zoom);

    return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
};

function toWebMercator(lon: number, lat: number) {
    const x = (lon * 20037508.34) / 180;
    const y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    return { x, y: (y * 20037508.34) / 180 };
}

export async function getBoundingBoxFromDataset(layerId: string) {
    const apiUrl = `${config.hostname}/data/api/datasets/${layerId}`;

    try {
        const response = await axios.get(apiUrl, { headers: getHeaders() });
        const boundingBox = response.data.boundingBox;

        if (boundingBox && boundingBox.length === 4) {
            return boundingBox;
        }
        throw new Error("Bounding box not found or invalid format.");
    } catch (error) {
        console.error("Error fetching bounding box from dataset API:", error);
        return null;
    }
}

export async function fetchResource(resourceType: string, resourceId: string, hazardType?: string) {
    let url = config.hostname;
    if (resourceType.toLowerCase() === "dataset") {
        url = `${url}/data/api/datasets/${resourceId}`;
    } else if (resourceType.toLowerCase() === "hazard") {
        url = `${url}/hazard/api/${hazardType}/${resourceId}`;
    } else if (resourceType.toLowerCase().includes("mapping")) {
        url = `${url}/dfr3/api/mappings/${resourceId}`;
    }

    try {
        const response = await axios.get(url, { headers: getHeaders() });

        // Check if the response has data
        if (!response.data || Object.keys(response.data).length === 0) {
            return { error: `No data found for resourceType: ${resourceType}, resourceId: ${resourceId}` };
        }

        return response.data;
    } catch (error: any) {
        // Handle axios-specific errors
        if (axios.isAxiosError(error)) {
            return {
                error: error.response
                    ? `Error: ${error.response.status} - ${error.response.data}`
                    : `Network or unknown error: ${error.message}`
            };
        }

        // Handle unexpected errors
        return { error: `Unexpected error: ${error.message}` };
    }
}

export function toSingular(disaster: string): string {
    // Mapping of plural to singular forms
    const singularMapping: { [key: string]: string } = {
        hurricanes: "hurricane",
        tornadoes: "tornado",
        tsunamis: "tsunami",
        floods: "flood",
        earthquakes: "earthquake"
    };

    // Convert to singular if it exists in the mapping, otherwise return original
    return singularMapping[disaster.toLowerCase()] || disaster;
}
