import { User } from "oidc-client";

import axios from "axios";

export function getOidcUser() {
    const oidcStorage = sessionStorage.getItem(`oidc.user:${window.AUTHORITY}:${window.CLIENT_ID}`);
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

export const getHeaders = () => {
    const user = getOidcUser(); // Assuming this function retrieves the user object with the access token
    const token = user?.access_token;
    const isLocalhost = window.API_SERVER.includes("localhost");

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
    const geoserverBaseUrl = `${window.API_SERVER}/geoserver/incore/wms`;
    const layerName = `incore:${id}`;
    const srs = "EPSG:4326"; // Projection
    return `${geoserverBaseUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&width=${width}&height=${height}&srs=${srs}&format=image/png&datasetId=${id}`;
}

export async function getGeoServerImageUrlAsDataUrl(id: string, width: number, height: number) {
    const geoserverBaseUrl = `${window.API_SERVER}/geoserver/incore/wms`;
    const layerName = `incore:${id}`;
    const srs = "EPSG:4326"; // Projection
    const url = `${geoserverBaseUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&width=${width}&height=${height}&srs=${srs}&format=image/png&datasetId=${id}`;

    try {
        // Fetch the image using axios
        const response = await axios.get(url, {
            headers: getHeaders(), // Include your auth headers
            responseType: "arraybuffer" // Important: fetch binary data
        });

        // Convert binary data to base64
        const base64Image = Buffer.from(response.data, "binary").toString("base64");

        // Create a Data URL
        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
}

export function getBoundingBoxFromCapabilities(layerName: string) {
    const capabilitiesUrl = `${window.API_SERVER}/geoserver/wms?service=WMS&request=GetCapabilities`;

    return axios
        .get(capabilitiesUrl, { headers: getHeaders() }) // Use axios with getHeaders()
        .then((response) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response.data, "text/xml"); // Parse the XML response
            const layer = Array.from(xmlDoc.getElementsByTagName("Layer")).find(
                (layer) => layer.getElementsByTagName("Name")[0].textContent === layerName
            );

            if (layer) {
                const bboxElement = layer.getElementsByTagName("EX_GeographicBoundingBox")[0];
                const minLon = bboxElement.getElementsByTagName("westBoundLongitude")[0].textContent;
                const minLat = bboxElement.getElementsByTagName("southBoundLatitude")[0].textContent;
                const maxLon = bboxElement.getElementsByTagName("eastBoundLongitude")[0].textContent;
                const maxLat = bboxElement.getElementsByTagName("northBoundLatitude")[0].textContent;

                return `${minLon},${minLat},${maxLon},${maxLat}`;
            }
            throw new Error("Layer not found");
        })
        .catch((error) => {
            console.error("Error fetching bounding box:", error);
            return null;
        });
}
