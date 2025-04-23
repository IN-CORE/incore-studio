import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Checkbox,
    Select,
    Option,
    IconButton,
    Button
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import config from "@app/app.config";

type LayerAccordionProps = {
    layers: IncoreLayer[];
    activeLayers: Record<string, boolean>;
    toggleLayer: (layerId: string) => void;
    deleteLayer: (layerId: string) => void;
    editLayerStyle: (layerId: string, newStyle: string | null) => void;
    addLayer: () => void;
    availableStyles?: string[];
};

export const LayerAccordion: React.FC<LayerAccordionProps> = ({
    layers,
    activeLayers,
    toggleLayer,
    deleteLayer,
    editLayerStyle,
    addLayer,
    availableStyles = config.sytles
}) => {
    return (
        <Accordion variant="plain" defaultExpanded>
            <AccordionSummary>
                <Typography level="body-md">Layers</Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ marginTop: "0.5em" }}>
                {layers.map((layer) => {
                    return (
                        <Box
                            key={layer.layerId}
                            sx={{
                                "display": "flex",
                                "flexDirection": "column",
                                "mb": 2,
                                "p": 1,
                                "borderRadius": "sm",
                                "&:hover": { backgroundColor: "neutral.softBg" }
                            }}
                        >
                            {/* First Row: Label and Checkbox */}
                            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <Checkbox
                                    checked={activeLayers[`incore-${layer.layerId}`]}
                                    onChange={() => toggleLayer(`incore-${layer.layerId}`)}
                                    size="sm"
                                    sx={{ mr: 1 }}
                                />
                                <Typography sx={{ flexGrow: 1 }}>{`${layer.workspace}:${layer.layerId}`}</Typography>
                            </Box>

                            {/* Second Row: Dropdown + Buttons */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    // gap: 1,
                                    mt: 1,
                                    ml: 3 // Match the Checkbox width (approx ~1 icon + margin)
                                }}
                            >
                                <Select
                                    value={layer.styleName ?? ""}
                                    placeholder={layer.styleName ? undefined : "Update Style"}
                                    size="sm"
                                    onChange={(_, value) => {
                                        editLayerStyle(layer.layerId, value);
                                    }}
                                    sx={{ minWidth: 140, mr: 1 }}
                                >
                                    {availableStyles.map((style) => (
                                        <Option key={style} value={style}>
                                            {style}
                                        </Option>
                                    ))}
                                </Select>
                                <IconButton color="danger" onClick={() => deleteLayer(layer.layerId)} sx={{ mr: 0.5 }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    );
                })}

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button color="primary" variant="plain" onClick={addLayer} startDecorator={<AddIcon />}>
                        Add Layer
                    </Button>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};
