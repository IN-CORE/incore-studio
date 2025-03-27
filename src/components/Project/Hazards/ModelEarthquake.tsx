import React, { useEffect, useState } from "react";
import { Box, Button, FormLabel, Input, Select, Option, TabPanel, Typography } from "@mui/joy";
import { createModelEarthquake, validateCoord } from "@app/utils/";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import config from "@app/app.config";
import { LngLatLike } from "maplibre-gl";

interface ModelEarthquakeProps {
    value: string;
    projectId: string;
    handleLayerUpdate: (hazardType: string) => void;
    points: LngLatLike[];
    setPoints: (points: LngLatLike[]) => void;
}

export const ModelEarthquake: React.FC<ModelEarthquakeProps> = ({
    value,
    projectId,
    handleLayerUpdate,
    points,
    setPoints
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coordLat, setCoordLat] = useState<string | number>("");
    const [coordLon, setCoordLon] = useState<string | number>("");
    const [magnitude, setMagnitude] = useState<number>(6.2);
    const [depth, setDepth] = useState<number>(10);
    const [demandType, setDemandType] = useState("PGA");
    const [demandUnits, setDemandUnits] = useState("g");
    const [attenuations, setAttenuations] = useState("AtkinsonBoore1995");
    const [faultTypeMap, setFaultTypeMap] = useState("Strike-Slip");
    const [disabled, setDisabled] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [validCoord, setValidCoord] = useState<boolean>(false);

    const appDispatch = useAppDispatch();

    const coordBoxSx = {
        width: "100%",
        height: "41px",
        fontSize: "15px",
        fontWeight: 500,
        lineHeight: "18px",
        border: "1px solid rgba(0, 0, 0, 0.23)",
        borderRadius: "4px",
        textAlign: "center",
        pl: "11.25px",
        display: "flex",
        alignItems: "center",
        gap: 1
    };

    const coordInputEditSx = {
        color: "#00619D",
        fontSize: "14px",
        height: "18px",
        border: "none",
        backgroundColor: "#FFFFFF",
        fontStyle: "italic",
        maxWidth: "10em"
    };

    const srcLatLabelSx = { fontSize: "14px", color: "#D63649" };
    const srcLonLabelSx = { fontSize: "14px", color: "#96B712" };

    // ✨ Autofill coords when `points` change
    useEffect(() => {
        if (points.length === 1) {
            const [lng, lat] = points[0] as number[];
            setCoordLat(lat);
            setCoordLon(lng);
            setValidCoord(validateCoord(lng, lat, config.VALID_MAP_BOUNDS as [number, number, number, number]));
        }
    }, [points]);

    // Enable/disable save button
    useEffect(() => {
        setDisabled(!(name && description && coordLat && coordLon && magnitude && depth && validCoord));
    }, [name, description, coordLat, coordLon, magnitude, depth, validCoord]);

    const onChangeLat = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLat = e.target.value;
        setCoordLat(newLat);

        const latNum = parseFloat(newLat);
        const lonNum = parseFloat(coordLon as string);

        const isValid = validateCoord(lonNum, latNum, config.VALID_MAP_BOUNDS as [number, number, number, number]);
        setValidCoord(isValid);

        if (!isNaN(latNum) && !isNaN(lonNum)) {
            setPoints([[lonNum, latNum]]);
        }
    };

    const onChangeLon = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLon = e.target.value;
        setCoordLon(newLon);

        const lonNum = parseFloat(newLon);
        const latNum = parseFloat(coordLat as string);

        const isValid = validateCoord(lonNum, latNum, config.VALID_MAP_BOUNDS as [number, number, number, number]);
        setValidCoord(isValid);

        if (!isNaN(latNum) && !isNaN(lonNum)) {
            setPoints([[lonNum, latNum]]);
        }
    };

    const onSave = async () => {
        setLoading(true);

        const eqJson = await createModelEarthquake(
            name,
            description,
            coordLat,
            coordLon,
            magnitude,
            depth,
            demandType,
            demandUnits,
            attenuations,
            faultTypeMap
        );

        if (eqJson && eqJson.id) {
            appDispatch(addHazardToProject({ projectId, hazards: [{ ...eqJson, type: "earthquake" }] }));
            handleLayerUpdate(eqJson.id);

            // Clear form + point
            setName("");
            setDescription("");
            setCoordLat("");
            setCoordLon("");
            setPoints([]); // 🔄 Clear point
        }

        setLoading(false);
    };

    return (
        <TabPanel value={value}>
            <Box component="form" sx={{ opacity: loading ? 0.5 : 1 }}>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Name
                    </FormLabel>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" fullWidth />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Description
                    </FormLabel>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Magnitude
                    </FormLabel>
                    <Input
                        type="number"
                        value={magnitude}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setMagnitude(val < 0 ? 0 : val);
                        }}
                        placeholder="Magnitude"
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Depth
                    </FormLabel>
                    <Input
                        type="number"
                        value={depth}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setDepth(val < 0 ? 0 : val);
                        }}
                        placeholder="Depth"
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Demand Type
                    </FormLabel>
                    <Select
                        value={demandType}
                        onChange={(_, newValue) => setDemandType(newValue as string)}
                        placeholder="Select Demand Type"
                    >
                        <Option value="PGA">PGA</Option>
                        <Option value="PGV">PGV</Option>
                        <Option value="0.1 Sec SA">0.1 Sec SA</Option>
                        <Option value="0.2 Sec SA">0.2 Sec SA</Option>
                        <Option value="0.3 Sec SA">0.3 Sec SA</Option>
                        <Option value="SD">SD</Option>
                        <Option value="SV">SV</Option>
                    </Select>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Demand Units
                    </FormLabel>
                    <Select
                        value={demandUnits}
                        onChange={(_, newValue) => setDemandUnits(newValue as string)}
                        placeholder="Select Demand Units"
                    >
                        <Option value="g">g</Option>
                        <Option value="in/s">in/s</Option>
                        <Option value="cm/s">cm/s</Option>
                        <Option value="in">in</Option>
                        <Option value="ft">ft</Option>
                        <Option value="m">m</Option>
                    </Select>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Attenuation Model
                    </FormLabel>
                    <Select
                        value={attenuations}
                        onChange={(_, newValue) => setAttenuations(newValue as string)}
                        placeholder="Select Attenuation Model"
                    >
                        <Option value="AtkinsonBoore1995">AtkinsonBoore1995</Option>
                        <Option value="ChiouYoungs2014">ChiouYoungs2014</Option>
                        <Option value="AbrahamsonSilvaKamai2014">AbrahamsonSilvaKamai2014</Option>
                        <Option value="CampbellBozorgnia2014">CampbellBozorgnia2014</Option>
                        <Option value="Toro1997">Toro1997</Option>
                    </Select>
                </Box>
                {(attenuations === "ChiouYoungs2014" ||
                    attenuations === "CampbellBozorgnia2014" ||
                    attenuations === "AbrahamsonSilvaKamai2014") && (
                    <Box sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Fault Mechanism
                        </FormLabel>
                        <Select
                            value={faultTypeMap}
                            onChange={(_, newValue) => setFaultTypeMap(newValue as string)}
                            placeholder="Select Fault Mechanism"
                        >
                            <Option value="Strike-Slip">Strike-Slip</Option>
                            <Option value="Normal">Normal</Option>
                            <Option value="Reverse-Thrust">Reverse-Thrust</Option>
                            <Option value="Reverse-Slip">Reverse-Slip</Option>
                            <Option value="All">All</Option>
                            <Option value="Reverse">Reverse</Option>
                        </Select>
                    </Box>
                )}
                {/* Coordinate fields and onChange are aware of state and points */}
                <Box sx={{ mb: 2 }}>
                    <FormLabel sx={{ fontSize: "1rem" }} required>
                        Earthquake Epicenter
                    </FormLabel>
                    {(coordLat !== "" || coordLon !== "") && !validCoord && (
                        <Typography level="body-sm" color="danger">
                            Coordinate not valid or outside of the bounding box.
                        </Typography>
                    )}
                    <Box sx={{ ...coordBoxSx, justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={srcLatLabelSx}>Lat:</Typography>
                            <Input
                                value={coordLat}
                                onChange={onChangeLat}
                                type="number"
                                placeholder={String(config.DEFAULT_MAP_CENTER[0])}
                                sx={coordInputEditSx}
                            />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={srcLonLabelSx}>Lon:</Typography>
                            <Input
                                value={coordLon}
                                onChange={onChangeLon}
                                type="number"
                                placeholder={String(config.DEFAULT_MAP_CENTER[1])}
                                sx={coordInputEditSx}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* rest of your inputs... */}
                <Box sx={{ mt: 3 }}>
                    <Button onClick={onSave} disabled={disabled || !validCoord} variant="solid">
                        Save
                    </Button>
                </Box>
            </Box>
        </TabPanel>
    );
};
