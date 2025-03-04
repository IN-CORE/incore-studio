import React, { useEffect, useState } from "react";
import { Box, Button, FormLabel, Select, Option, TabPanel, Input } from "@mui/joy";
import { validateCoord, createModelTornado } from "@app/utils/";
import config from "@app/app.config";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";

// Define props type
interface ModelTornadoProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (hazardId: string) => void;
}

export const ModelTornado: React.FC<ModelTornadoProps> = ({ index, projectId, handleLayerUpdate }) => {
    const dispatch = useAppDispatch();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState("EF3");
    const [startLatCoord, setStartLatCoord] = useState<string | number>("");
    const [startLonCoord, setStartLonCoord] = useState<string | number>("");
    const [endLatCoord, setEndLatCoord] = useState<string | number>("");
    const [endLonCoord, setEndLonCoord] = useState<string | number>("");
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [validStartCoord, setValidStartCoord] = useState(true);
    const [validEndCoord, setValidEndCoord] = useState(false);

    const labelStyles = {
        start: { color: "#96B712", fontSize: "14px" },
        end: { color: "#D63649", fontSize: "14px" }
    };

    const inputStyles = {
        color: "#00619D",
        fontSize: "14px",
        height: "18px",
        border: "none",
        maxWidth: "10em",
        background: "#FFFFFF",
        fontStyle: "italic"
    };

    const coordBoxSx = {
        width: "100%",
        height: "41px",
        fontSize: "15px",
        fontWeight: "500",
        border: "1px solid rgba(0, 0, 0, 0.23)",
        borderRadius: "4px",
        textAlign: "center",
        padding: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    };

    useEffect(() => {
        setDisabled(
            !(
                name &&
                description &&
                startLatCoord &&
                startLonCoord &&
                endLatCoord &&
                endLonCoord &&
                rating &&
                validStartCoord &&
                validEndCoord
            )
        );
    }, [
        name,
        description,
        startLatCoord,
        startLonCoord,
        endLatCoord,
        endLonCoord,
        rating,
        validStartCoord,
        validEndCoord
    ]);

    const onSave = async () => {
        setLoading(true);

        const tornadoJson = await createModelTornado(
            name,
            description,
            rating,
            startLatCoord,
            startLonCoord,
            endLatCoord,
            endLonCoord
        );

        if (tornadoJson && tornadoJson.id) {
            dispatch(addHazardToProject({ projectId, hazards: [tornadoJson] }));
            handleLayerUpdate(tornadoJson.id);
            setName("");
            setDescription("");
            setStartLatCoord("");
            setStartLonCoord("");
            setEndLatCoord("");
            setEndLonCoord("");
        }

        setLoading(false);
    };

    return (
        <TabPanel value={index}>
            <Box component="form" sx={{ opacity: loading ? 0.5 : 1 }}>
                <Box sx={{ mb: 2 }}>
                    <FormLabel className="required-field">Name</FormLabel>
                    <Input value={name} variant="outlined" onChange={(e) => setName(e.target.value)} />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel className="required-field">Description</FormLabel>
                    <Input value={description} variant="outlined" onChange={(e) => setDescription(e.target.value)} />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel className="required-field">Rating</FormLabel>
                    <Select value={rating} onChange={(_, value) => setRating(value as string)}>
                        {["EF0", "EF1", "EF2", "EF3", "EF4", "EF5"].map((level) => (
                            <Option key={level} value={level}>
                                {level}
                            </Option>
                        ))}
                    </Select>
                </Box>
                <>
                    {[
                        {
                            type: "Start",
                            lat: startLatCoord,
                            lon: startLonCoord,
                            setLat: setStartLatCoord,
                            setLon: setStartLonCoord,
                            isValid: validStartCoord,
                            setValid: setValidStartCoord
                        },
                        {
                            type: "End",
                            lat: endLatCoord,
                            lon: endLonCoord,
                            setLat: setEndLatCoord,
                            setLon: setEndLonCoord,
                            isValid: validEndCoord,
                            setValid: setValidEndCoord
                        }
                    ].map(({ type, lat, lon, setLat, setLon, isValid, setValid }, index) => (
                        <Box key={type} sx={{ mb: 2 }}>
                            <FormLabel sx={{ fontSize: "1rem" }} required>
                                Tornado Path {type} Coordinate
                            </FormLabel>
                            {!isValid && (
                                <span style={{ color: "red" }}>Coordinate not valid or outside the bounding box.</span>
                            )}
                            <Box
                                key={type}
                                sx={{
                                    ...coordBoxSx,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <FormLabel sx={index === 0 ? labelStyles.start : labelStyles.end}>
                                        {type} Lat:
                                    </FormLabel>
                                    <Input
                                        sx={inputStyles}
                                        type="number"
                                        value={lat ?? ""}
                                        onChange={(e) => setLat(e.target.value)}
                                        placeholder={String(config.DEFAULT_MAP_CENTER[0])}
                                    />
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <FormLabel sx={index === 0 ? labelStyles.start : labelStyles.end}>
                                        {type} Lon:
                                    </FormLabel>
                                    <Input
                                        sx={inputStyles}
                                        type="number"
                                        value={lon ?? ""}
                                        onChange={(e) => setLon(e.target.value)}
                                        placeholder={String(config.DEFAULT_MAP_CENTER[1])}
                                    />
                                </Box>
                                <Button
                                    variant="plain"
                                    onClick={() => {
                                        setValid(
                                            validateCoord(
                                                lat,
                                                lon,
                                                config.VALID_MAP_BOUNDS as [number, number, number, number]
                                            )
                                        );
                                    }}
                                >
                                    Validate
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </>
                <Box sx={{ mb: 2 }}>
                    <Button variant="solid" onClick={onSave} disabled={disabled || !validStartCoord || !validEndCoord}>
                        Save
                    </Button>
                </Box>
            </Box>
        </TabPanel>
    );
};
