import React, { useState } from "react";
import { Box, Button, TabPanel } from "@mui/joy";
import { useAppDispatch } from "@app/store/hooks";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { createRjfsDatasetHazards, getLayerBoundingBox } from "@app/utils";
import { addHazardToProject } from "@app/reducer/projectSlice";
import Form from "@rjsf/mui";
import DatasetFloodSchema from "@app/schema/tsunami/datasetTsunami.json";
import DatasetFloodUiSchema from "@app/schema/tsunami/datasetTsunamiUi.json";
import validator from "@rjsf/validator-ajv8";
import config from "@app/app.config";

interface DatasetTsunamiProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (layers: IncoreLayer[]) => void;
}

export const DatasetTsunami: React.FC<DatasetTsunamiProps> = ({ index, projectId, handleLayerUpdate }) => {
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
            const tsunamiJson = await createRjfsDatasetHazards(formData, "tsunamis");
            if (tsunamiJson && tsunamiJson.id) {
                appDispatch(addHazardToProject({ projectId, hazards: [tsunamiJson] }));
                // Collect all boundingBox promises inside an async function
                const layerData = await Promise.all(
                    tsunamiJson.hazardDatasets.map(async (dataset: HazardDataset) => ({
                        workspace: "incore",
                        layerId: dataset.datasetId,
                        styleName: config.defaultLayerStyles.MapUtil.tsunami,
                        boundingBox: await getLayerBoundingBox(dataset.datasetId)
                    }))
                );

                handleLayerUpdate(layerData);
            }
        } catch (error) {
            console.error("Error saving tsunami dataset:", error);
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
