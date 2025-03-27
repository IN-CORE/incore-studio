import React, { useEffect, useState } from "react";
import { Box, Button, FormLabel, Select, Option, TabPanel, Input } from "@mui/joy";
import { validateCoord, createModelTornado } from "@app/utils/";
import config from "@app/app.config";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { LngLatLike } from "maplibre-gl";

interface ModelTornadoProps {
    value: string;
    projectId: string;
    handleLayerUpdate: (hazardId: string) => void;
    points: LngLatLike[];
    setPoints: (points: LngLatLike[]) => void;
}

export const ModelTornado: React.FC<ModelTornadoProps> = ({
    value,
    projectId,
    handleLayerUpdate,
    points,
    setPoints
}) => {
    const dispatch = useAppDispatch();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState("EF3");

    const [startLatCoord, setStartLatCoord] = useState<string | number>("");
    const [startLonCoord, setStartLonCoord] = useState<string | number>("");
    const [endLatCoord, setEndLatCoord] = useState<string | number>("");
    const [endLonCoord, setEndLonCoord] = useState<string | number>("");

    const [validStartCoord, setValidStartCoord] = useState(false);
    const [validEndCoord, setValidEndCoord] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

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
        if (points.length === 2) {
            const [start, end] = points;
            const [startLon, startLat] = start as number[];
            const [endLon, endLat] = end as number[];

            setStartLatCoord(startLat);
            setStartLonCoord(startLon);
            setEndLatCoord(endLat);
            setEndLonCoord(endLon);

            const validStart = validateCoord(
                startLon,
                startLat,
                config.VALID_MAP_BOUNDS as [number, number, number, number]
            );
            const validEnd = validateCoord(endLon, endLat, config.VALID_MAP_BOUNDS as [number, number, number, number]);
            setValidStartCoord(validStart);
            setValidEndCoord(validEnd);
        }
    }, [points]);

    useEffect(() => {
        setDisabled(
            !(
                name &&
                description &&
                rating &&
                startLatCoord &&
                startLonCoord &&
                endLatCoord &&
                endLonCoord &&
                validStartCoord &&
                validEndCoord
            )
        );
    }, [
        name,
        description,
        rating,
        startLatCoord,
        startLonCoord,
        endLatCoord,
        endLonCoord,
        validStartCoord,
        validEndCoord
    ]);

    const updatePointsFromForm = (
        newStartLat: string | number,
        newStartLon: string | number,
        newEndLat: string | number,
        newEndLon: string | number
    ) => {
        const sLat = parseFloat(newStartLat as string);
        const sLon = parseFloat(newStartLon as string);
        const eLat = parseFloat(newEndLat as string);
        const eLon = parseFloat(newEndLon as string);

        if (!isNaN(sLat) && !isNaN(sLon) && !isNaN(eLat) && !isNaN(eLon)) {
            setPoints([
                [sLon, sLat],
                [eLon, eLat]
            ]);
        }
    };

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

        if (tornadoJson?.id) {
            dispatch(addHazardToProject({ projectId, hazards: [tornadoJson] }));
            handleLayerUpdate(tornadoJson.id);

            setName("");
            setDescription("");
            setStartLatCoord("");
            setStartLonCoord("");
            setEndLatCoord("");
            setEndLonCoord("");
            setPoints([]);
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
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Description
                    </FormLabel>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <FormLabel required sx={{ fontSize: "1rem" }}>
                        Rating
                    </FormLabel>
                    <Select value={rating} onChange={(_, val) => setRating(val as string)}>
                        {["EF0", "EF1", "EF2", "EF3", "EF4", "EF5"].map((r) => (
                            <Option key={r} value={r}>
                                {r}
                            </Option>
                        ))}
                    </Select>
                </Box>

                {[
                    {
                        label: "Start",
                        lat: startLatCoord,
                        lon: startLonCoord,
                        setLat: setStartLatCoord,
                        setLon: setStartLonCoord,
                        isValid: validStartCoord,
                        setValid: setValidStartCoord
                    },
                    {
                        label: "End",
                        lat: endLatCoord,
                        lon: endLonCoord,
                        setLat: setEndLatCoord,
                        setLon: setEndLonCoord,
                        isValid: validEndCoord,
                        setValid: setValidEndCoord
                    }
                ].map(({ label, lat, lon, setLat, setLon, isValid, setValid }, index) => (
                    <Box key={label} sx={{ mb: 2 }}>
                        <FormLabel required sx={{ fontSize: "1rem" }}>
                            Tornado Path {label} Coordinate
                        </FormLabel>
                        {(lat !== "" || lon !== "") && !isValid && (
                            <span style={{ color: "red" }}>Invalid or out-of-bounds coordinates.</span>
                        )}
                        <Box sx={coordBoxSx}>
                            <Box display="flex" alignItems="center">
                                <FormLabel sx={index === 0 ? labelStyles.start : labelStyles.end}>
                                    {label} Lat:
                                </FormLabel>
                                <Input
                                    sx={inputStyles}
                                    type="number"
                                    value={lat ?? ""}
                                    placeholder={String(config.DEFAULT_MAP_CENTER[0])}
                                    onChange={(e) => {
                                        const newLat = e.target.value;
                                        setLat(newLat);
                                        const valid = validateCoord(
                                            lon,
                                            newLat,
                                            config.VALID_MAP_BOUNDS as [number, number, number, number]
                                        );
                                        setValid(valid);

                                        const updatedStartLat = label === "Start" ? newLat : startLatCoord;
                                        const updatedEndLat = label === "End" ? newLat : endLatCoord;

                                        updatePointsFromForm(
                                            updatedStartLat,
                                            startLonCoord,
                                            updatedEndLat,
                                            endLonCoord
                                        );
                                    }}
                                />
                            </Box>
                            <Box display="flex" alignItems="center">
                                <FormLabel sx={index === 0 ? labelStyles.start : labelStyles.end}>
                                    {label} Lon:
                                </FormLabel>
                                <Input
                                    sx={inputStyles}
                                    type="number"
                                    value={lon ?? ""}
                                    placeholder={String(config.DEFAULT_MAP_CENTER[1])}
                                    onChange={(e) => {
                                        const newLon = e.target.value;
                                        setLon(newLon);
                                        const valid = validateCoord(
                                            newLon,
                                            lat,
                                            config.VALID_MAP_BOUNDS as [number, number, number, number]
                                        );
                                        setValid(valid);

                                        const updatedStartLon = label === "Start" ? newLon : startLonCoord;
                                        const updatedEndLon = label === "End" ? newLon : endLonCoord;

                                        updatePointsFromForm(
                                            startLatCoord,
                                            updatedStartLon,
                                            endLatCoord,
                                            updatedEndLon
                                        );
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                ))}

                <Box sx={{ mb: 2 }}>
                    <Button variant="solid" onClick={onSave} disabled={disabled}>
                        Save
                    </Button>
                </Box>
            </Box>
        </TabPanel>
    );
};
