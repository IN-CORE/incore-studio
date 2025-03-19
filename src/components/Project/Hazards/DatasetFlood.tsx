import React, { useState } from "react";
import { useAppDispatch } from "@app/store/hooks";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { createRjfsDatasetHazards, getLayerBoundingBox } from "@app/utils";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { Box, Button, TabPanel } from "@mui/joy";
import Form from "@rjsf/mui";
import DatasetFloodSchema from "@app/schema/flood/datasetFlood.json";
import DatasetFloodUiSchema from "@app/schema/flood/datasetFloodUi.json";
import validator from "@rjsf/validator-ajv8";
import config from "@app/app.config";

interface DatasetFloodProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (layers: IncoreLayer[]) => void;
}

export const DatasetFlood: React.FC<DatasetFloodProps> = ({ index, projectId, handleLayerUpdate }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [formKey, setFormKey] = useState<number>(0);

    const appDispatch = useAppDispatch();

    const widgets: RegistryWidgetsType<any, RJSFSchema, any> = {
        TextWidget: CustomTextInput as React.FC<any>,
        SelectWidget: CustomSelectWidget as React.FC<any>
    };

    // Function to handle save
    const onSave = async (formData: Record<string, any>) => {
        setLoading(true);
        try {
            const floodJson = await createRjfsDatasetHazards(formData, "floods");
            if (floodJson && floodJson.id) {
                appDispatch(addHazardToProject({ projectId, hazards: [floodJson] }));

                // Collect all boundingBox promises inside an async function
                const layerData = await Promise.all(
                    floodJson.hazardDatasets.map(async (dataset: HazardDataset) => ({
                        workspace: "incore",
                        layerId: dataset.datasetId,
                        styleName:
                            // TODO type check
                            // @ts-ignore
                            config.defaultLayerStyles.MapUtil.flood?.[dataset.demandType] ??
                            config.defaultLayerStyles.MapUtil.flood.inundationDepth,
                        boundingBox: await getLayerBoundingBox(dataset.datasetId)
                    }))
                );

                handleLayerUpdate(layerData);
            }
        } catch (error) {
            console.error("Error saving flood dataset:", error);
        } finally {
            setLoading(false);
            // Reset form by updating the formKey
            setFormKey((prevKey) => prevKey + 1);
        }
    };

    return (
        <TabPanel value={index}>
            <Box sx={{ opacity: loading ? 0.5 : 1 }}>
                <Form
                    key={formKey}
                    schema={DatasetFloodSchema}
                    uiSchema={DatasetFloodUiSchema}
                    widgets={widgets}
                    validator={validator}
                    onSubmit={({ formData }) => onSave(formData)}
                >
                    <Box>
                        <Button variant="solid" type="submit">
                            Save
                        </Button>
                    </Box>
                </Form>
            </Box>
        </TabPanel>
    );
};
