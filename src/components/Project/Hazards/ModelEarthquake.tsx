import React, { useEffect, useState } from "react";
import { Box, Button, FormLabel, Input, Select, Option, TabPanel, Typography } from "@mui/joy";
import { createModelEarthquake, validateCoord } from "@app/utils/";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import config from "@app/app.config";

interface ModelEarthquakeProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (hazardType: string) => void;
}

export const ModelEarthquake: React.FC<ModelEarthquakeProps> = ({ index, projectId, handleLayerUpdate }) => {
    // Local state for form fields
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
    const [validCoord, setValidCoord] = useState<boolean>(true);

    const appDispatch = useAppDispatch();

    // Inline sx styles for coordinate inputs and labels
    const coordBoxSx = {
        width: "100%",
        height: "41px",
        fontSize: "15px",
        fontWeight: 500,
        lineHeight: "18px",
        letterSpacing: 0,
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

    // Enable the Save button when required fields are set and editing is off
    useEffect(() => {
        if (name && description && coordLat && coordLon && magnitude && depth && validCoord) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [name, description, coordLat, coordLon, magnitude, depth, validCoord]);

    // Save handler: call the API, update layers/lists, and reset the form
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
            appDispatch(addHazardToProject({ projectId, hazards: [eqJson] }));
            handleLayerUpdate(eqJson);
            // Reset form fields
            setName("");
            setDescription("");
            setCoordLat("");
            setCoordLon("");
        }
        setLoading(false);
    };

    return (
        <TabPanel value={index}>
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
                <Box sx={{ mb: 2 }}>
                    <FormLabel sx={{ fontSize: "1rem" }} required>
                        Earthquake Epicenter
                    </FormLabel>
                    {coordLat !== null && coordLon !== null && !validCoord && (
                        <Typography level="body-sm" color="danger">
                            Coordinate not valid or outside of the bounding box.
                        </Typography>
                    )}
                    <Box sx={{ ...coordBoxSx, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={srcLatLabelSx}>Lat:</Typography>
                            <Input
                                value={coordLat !== null ? coordLat : ""}
                                onChange={(e) => setCoordLat(e.target.value)}
                                type="number"
                                placeholder={String(config.DEFAULT_MAP_CENTER[0])}
                                sx={coordInputEditSx}
                            />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={srcLonLabelSx}>Lon:</Typography>
                            <Input
                                value={coordLon !== null ? coordLon : ""}
                                onChange={(e) => setCoordLon(e.target.value)}
                                type="number"
                                placeholder={String(config.DEFAULT_MAP_CENTER[1])}
                                sx={coordInputEditSx}
                            />
                        </Box>
                        <Button
                            variant="plain"
                            onClick={() => {
                                setValidCoord(
                                    validateCoord(
                                        coordLon,
                                        coordLat,
                                        config.VALID_MAP_BOUNDS as [number, number, number, number]
                                    )
                                );
                            }}
                        >
                            Validate
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button onClick={onSave} disabled={disabled || !validCoord} variant="solid">
                        Save
                    </Button>
                </Box>
            </Box>
        </TabPanel>
    );
};
