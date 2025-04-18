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

export async function searchResource(
    resourceType: string,
    query: string,
    limit?: number,
    skip?: number,
    hazardType?: string
) {
    let url = config.hostname;

    if (resourceType.toLowerCase() === "dataset") {
        url = `${url}/data/api/datasets/search?text=${query}&limit=${limit ?? 5}&skip=${skip ?? 0}`;
    } else if (resourceType.toLowerCase() === "hazard") {
        url = `${url}/hazard/api/${hazardType}/search?text=${query}&limit=${limit ?? 5}&skip=${skip ?? 0}`;
    } else if (resourceType.toLowerCase().includes("mapping")) {
        url = `${url}/dfr3/api/mappings/search?text=${query}&limit=${limit ?? 5}&skip=${skip ?? 0}`;
    }

    try {
        const response = await axios.get(url, { headers: getHeaders() });

        // Check if the response has data
        if (!response.data || Object.keys(response.data).length === 0) {
            return { error: `No data found for resourceType: ${resourceType}, query: ${query}` };
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

export const extractStatus = (executionItem: DatawolfExecutionFile | null): string => {
    if (executionItem !== null && executionItem.stepState !== undefined) {
        const statusArr = Object.values(executionItem.stepState);
        const datasetStatusArr = Object.values(executionItem.datasets);
        // WAITING, QUEUED, RUNNING, FINISHED, ABORTED, FAILED, UNKNOWN
        // if failed or aborted, return failed | aborted
        // else if atleast one running, return running
        // else if atleast one queued, return queued
        // else if atleast one waiting, return waiting
        // else if any unknown, return unknown
        // last case where we need to check all values are finished then return finished
        // else return undefined
        if (statusArr.indexOf("FAILED") >= 0) return "FAILED";
        if (statusArr.indexOf("ABORTED") >= 0) return "ABORTED";
        if (statusArr.indexOf("RUNNING") >= 0) return "RUNNING";
        if (statusArr.indexOf("QUEUED") >= 0) return "QUEUED";
        if (statusArr.indexOf("WAITING") >= 0) return "WAITING";
        if (statusArr.indexOf("UNKNOWN") >= 0) return "UNKNOWN";
        if (datasetStatusArr.indexOf("ERROR") >= 0) return "FAILED";
        if (statusArr.every((status) => status === "FINISHED")) return "FINISHED";
    }
    return "UNDEFINED";
};

export function getStatusColor(status?: string) {
    switch (status) {
        case "FAILED":
        case "ABORTED":
            return "danger";
        case "RUNNING":
            return "primary";
        case "QUEUED":
            return "neutral";
        case "WAITING":
        case "UNKNOWN":
            return "warning";
        case "FINISHED":
            return "success";
        default:
            return "neutral";
    }
}

export const getOutputDatasetIDsFromExecutionFile = (
    execution: DatawolfExecutionFile,
    workflow: DatawolfWorkflowFile
): string[] => {
    const outputDatasetIDs: string[] = [];
    if (!execution || !workflow || !workflow.steps) {
        return outputDatasetIDs;
    }

    workflow.steps.forEach((step) => {
        Object.entries(step.outputs).forEach(([outputKey, outputValue]) => {
            if (
                outputValue !== "" &&
                outputValue !== null &&
                execution.datasets[outputValue] !== "" &&
                execution.datasets[outputValue] !== null &&
                execution.datasets[outputValue] !== "ERROR" &&
                outputKey !== "stdout"
            ) {
                outputDatasetIDs.push(execution.datasets[outputValue]);
            }
        });
    });

    return outputDatasetIDs;
};

export const getOutputDatasetIDsFromWorkflows = async (workflows: DatawolfWorkflowFile[]): Promise<string[]> => {
    const outputDatasetIDs: string[] = [];
    for (const workflow of workflows) {
        try {
            const executions = await axios.get(`${config.datawolfApi}/workflows/${workflow.id ?? ""}/executions`, {
                headers: getHeaders()
            });
            if (executions.data) {
                for (const execution of executions.data) {
                    outputDatasetIDs.push(...getOutputDatasetIDsFromExecutionFile(execution, workflow));
                }
            }
        } catch (error: any) {
            // Handle axios-specific errors
            if (axios.isAxiosError(error)) {
                console.error(
                    "Error fetching executions:",
                    error.response
                        ? `Error: ${error.response.status} - ${error.response.data}`
                        : `Network or unknown error: ${error.message}`
                );
            }

            // Handle unexpected errors
            console.error("Unexpected error:", error.message);
        }
    }
    return outputDatasetIDs;
};

export function downloadMetadata(data: any): void {
    const metadata = JSON.stringify(data, null, 2); // Example metadata formatting
    const blob = new Blob([metadata], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || data.title || "metadata"}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// export function attachExecutionStatusToSteps(execution: DatawolfExecutionFile, workflow: Workflow) {
//     if (!execution || !workflow || !workflow.steps) {
//         throw new Error("Invalid execution or workflow data.");
//     }
//
//     return workflow.steps.map((step) => {
//         const stepId = step.id;
//
//         return {
//             ...step,
//             executionStatus: execution.stepState?.[stepId] || "NOT_STARTED", // Default to "NOT_STARTED"
//             queuedAt: execution.stepsQueued?.[stepId] || null,
//             startedAt: execution.stepsStart?.[stepId] || null,
//             endedAt: execution.stepsEnd?.[stepId] || null,
//         };
//     });
// }

export function breakCamelCaseAndCapitalize(camelCaseString: string): string {
    return camelCaseString
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle consecutive uppercase letters
        .trim() // Remove leading/trailing spaces
        .split(" ") // Split into words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(" "); // Join the words back into a phrase
}

declare const defaultMapConfig: { HAZARD_BOUNDS: [number, number, number, number] };

export function dataURItoFile(dataURI: string, filename = "hurricane-raster.tif"): File {
    if (!dataURI.includes(",")) {
        throw new Error("Invalid Data URI format");
    }

    const mimeMatch = dataURI.match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error("MIME type not found in Data URI");
    }

    const mime = mimeMatch[1];
    const binary = atob(dataURI.split(",")[1]);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        // Use i += 1 instead of i++
        array[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([array], { type: mime });
    return new File([blob], filename, { type: mime, lastModified: Date.now() });
}

export function getHazardTypePlural(hazardType: string): string {
    return hazardType.match(/\b(o|s|sh|ch|x|z)\b$/) ? `${hazardType}es` : `${hazardType}s`;
}

export function round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
}

export async function createModelTornado(
    name: string,
    description: string,
    rating: string,
    startLat: number | string,
    startLon: number | string,
    endLat: number | string,
    endLon: number | string
): Promise<any> {
    const startLatNum = typeof startLat === "number" ? startLat : parseFloat(startLat);
    const startLonNum = typeof startLon === "number" ? startLon : parseFloat(startLon);
    const endLatNum = typeof endLat === "number" ? endLat : parseFloat(endLat);
    const endLonNum = typeof endLon === "number" ? endLon : parseFloat(endLon);

    const endpoint = `${config.hazardApi}/tornadoes`;
    const formData = new FormData();
    const tornadoMetadata: TornadoMetadata = {
        tornadoType: "model",
        name,
        description,
        tornadoModel: "MeanWidthTornado",
        tornadoParameters: {
            efRating: rating,
            startLatitude: startLatNum,
            startLongitude: startLonNum,
            endLatitude: [endLatNum],
            endLongitude: [endLonNum],
            windSpeedMethod: "1"
        }
    };
    formData.append("tornado", JSON.stringify(tornadoMetadata));

    try {
        const response = await axios.post(endpoint, formData, {
            headers: getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("Error in API request:", error);
        return {};
    }
}

export async function getHazardMetadata(hazardType: string, hazardId: string): Promise<any> {
    const hazardTypePlural = getHazardTypePlural(hazardType);
    const endpoint = `${config.hazardApi}/${hazardTypePlural}/${hazardId}`;

    try {
        const response = await axios.get(endpoint, {
            headers: getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("Error in API request:", error);
        return {};
    }
}

export async function createModelEarthquake(
    name: string,
    description: string,
    lat: number | string,
    lon: number | string,
    magnitude: number,
    depth: number,
    demandType: string,
    demandUnits: string,
    attenuations: string,
    faultTypeMap?: any
): Promise<any> {
    const lonNum = typeof lon === "number" ? lon : parseFloat(lon);
    const latNum = typeof lat === "number" ? lat : parseFloat(lat);

    const endpoint = `${config.hazardApi}/earthquakes`;
    const formData = new FormData();

    const eqMetadata: EarthquakeMetadata = {
        name,
        description,
        eqType: "model",
        attenuations: { [attenuations]: 1.0 },
        eqParameters: {
            srcLatitude: latNum,
            srcLongitude: lonNum,
            magnitude,
            depth
        },
        visualizationParameters: {
            demandType,
            demandUnits,
            minX: round(lonNum - 1, 3),
            minY: round(latNum - 1, 3),
            maxX: round(lonNum + 1, 3),
            maxY: round(latNum + 1, 3),
            numPoints: "1025",
            amplifyHazard: "true"
        }
    };

    if (faultTypeMap) {
        eqMetadata.eqParameters.faultTypeMap = { [attenuations]: faultTypeMap };
    }

    formData.append("earthquake", JSON.stringify(eqMetadata));

    try {
        const response = await axios.post(endpoint, formData, {
            headers: getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("Error in API request:", error);
        return {};
    }
}

export async function createDatasetTornado(name: string, description: string, files: File[]) {
    const endpoint = `${config.hazardApi}/tornadoes`;
    const payload = new FormData();

    const tornadoMetadata = {
        tornadoType: "dataset",
        name,
        description
    };
    payload.append("tornado", JSON.stringify(tornadoMetadata));
    files.forEach((file: File) => {
        payload.append("file", file);
    });

    try {
        const response = await axios.post(endpoint, payload, {
            headers: getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("Error in API request:", error);
        return {};
    }
}

export async function createRjfsDatasetHazards(formData: any, hazardType: string): Promise<any> {
    const endpoint = `${config.hazardApi}/${hazardType}`;
    const dataUrls: { dataurl: string; filename: string }[] = [];
    const payload = new FormData();

    formData.hazardDatasets.forEach((hazardDataset: any) => {
        dataUrls.push({
            dataurl: hazardDataset.file,
            filename: `${hazardDataset.demandType}-raster.tif`
        });
        delete hazardDataset.file;
    });

    dataUrls.forEach((dataurl) => {
        payload.append("file", dataURItoFile(dataurl.dataurl, dataurl.filename));
    });

    payload.append(hazardType.slice(0, -1), JSON.stringify(formData));

    try {
        const response = await axios.post(endpoint, payload, {
            headers: getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("Error in API request:", error);
        return {};
    }
}

/**
 * Converts a Web Mercator coordinate ([x, y]) to geographic coordinates ([lon, lat]).
 * @param flatCoord - A tuple of [x, y] in Web Mercator (EPSG:3857).
 * @returns A tuple of [lon, lat] in degrees (EPSG:4326).
 */
export function flatCoordToLonLat(flatCoord: [number, number]): [number, number] {
    const [x, y] = flatCoord;
    const lon = (x * 180) / 20037508.34;
    const lat = ((2 * Math.atan(Math.exp((y * Math.PI) / 20037508.34)) - Math.PI / 2) * 180) / Math.PI;
    return [lon, lat];
}

/**
 * Converts geographic coordinates ([lon, lat]) in degrees to a Web Mercator coordinate.
 * @param lon - Longitude in degrees.
 * @param lat - Latitude in degrees.
 * @returns A tuple of [x, y] in Web Mercator (EPSG:3857).
 */
export function lonLatToFlatCoord(lon: string | number, lat: string | number): [number, number] {
    const lonNum = typeof lon === "number" ? lon : parseFloat(lon);
    const latNum = typeof lat === "number" ? lat : parseFloat(lat);
    const x = (lonNum * 20037508.34) / 180;
    const y = (Math.log(Math.tan(((90 + latNum) * Math.PI) / 360)) * 20037508.34) / 180;
    return [x, y];
}

export function roundToScale(num: number, scale: number): number {
    if (!num.toString().includes("e")) {
        return Number(`${Math.round(Number(`${num}e+${scale}`))}e-${scale}`);
    }
    const arr = num.toString().split("e");
    let sig = "";
    if (Number(arr[1]) + scale > 0) {
        sig = "+";
    }
    return Number(`${Math.round(Number(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`))}e-${scale}`);
}

export const validateCoord = (
    lon: number | string,
    lat: number | string,
    boundingBox: [number, number, number, number]
): boolean => {
    const lonNum = typeof lon === "number" ? lon : parseFloat(lon);
    const latNum = typeof lat === "number" ? lat : parseFloat(lat);

    if (Number.isNaN(lonNum) || Number.isNaN(latNum)) {
        return false;
    }

    return lonNum > boundingBox[0] && lonNum < boundingBox[2] && latNum > boundingBox[1] && latNum < boundingBox[3];
};

export async function getLayerBoundingBox(datasetId: string): Promise<[number, number, number, number] | null> {
    try {
        const url = `${config.dataApi}/datasets/${datasetId}`;
        const response = await axios.get<{ boundingBox?: [number, number, number, number] }>(url, {
            headers: getHeaders()
        });

        if (response.data && response.data.boundingBox) {
            return response.data.boundingBox;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching dataset ${datasetId}:`, error);
        return null;
    }
}

export async function createDataset(
    title: string,
    description: string,
    dataType: string,
    format: string,
    files: File[]
): Promise<any> {
    try {
        const dataEndpoint = `${config.dataApi}/datasets`;
        const datasetMetadata = {
            title,
            description,
            contributors: [],
            dataType,
            storedUrl: "",
            format,
            sourceDataset: "",
            networkDataset: null
        };

        const datasetFormData = new FormData();
        datasetFormData.append("dataset", JSON.stringify(datasetMetadata));

        const datasetResponse = await axios.post(dataEndpoint, datasetFormData, {
            headers: getHeaders()
        });

        if (datasetResponse.status === 200) {
            const datasetJson = datasetResponse.data;
            const datasetId = datasetJson.id;
            const fileEndpoint = `${config.dataApi}/datasets/${datasetId}/files`;

            const fileFormData = new FormData();
            files.forEach((file) => {
                fileFormData.append("file", file);
            });

            const fileResponse = await axios.post(fileEndpoint, fileFormData, {
                headers: getHeaders()
            });

            return fileResponse.status === 200 ? fileResponse.data : {};
        }
        return {};
    } catch (error) {
        console.error("Error creating dataset:", error);
        return {};
    }
}

// When the input loses focus, trim the value.
export const handleBlur = <T extends string>(value: T, setValue: React.Dispatch<React.SetStateAction<T>>) => {
    const trimmedValue = value.trim() as T;
    setValue(trimmedValue);
};

// For the Vega Chart
export type VegaDataType = "quantitative" | "temporal" | "ordinal" | "nominal" | "geojson" | "unknown";

export function guessDataType(inputString: string): VegaDataType {
    const quantitativePattern = /^[-+]?\d+(\.\d+)?$/;
    const temporalPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    const ordinalPattern = /[a-zA-Z]/;
    const nominalPattern = /[a-zA-Z]/;
    const geojsonPattern = /^(\{"type": "Feature".*?\}|{"type": "FeatureCollection".*?})$/;

    if (quantitativePattern.test(inputString)) {
        return "quantitative";
    }
    if (temporalPattern.test(inputString)) {
        return "temporal";
    }
    if (geojsonPattern.test(inputString)) {
        return "geojson";
    }
    if (ordinalPattern.test(inputString)) {
        return "ordinal";
    }
    if (nominalPattern.test(inputString)) {
        return "nominal";
    }
    return "unknown";
}
