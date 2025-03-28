import React, { useState } from "react";
import { Box, Button, TabPanel } from "@mui/joy";
import Form from "@rjsf/mui";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import DatasetEqSchema from "@app/schema/earthquake/datasetEarthquake.json";
import DatasetEqUiSchema from "@app/schema/earthquake/datasetEarthquakeUi.json";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { createRjfsDatasetHazards } from "@app/utils";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useAppDispatch } from "@app/store/hooks";
import config from "@app/app.config";

// Define props type
interface DatasetEarthquakeProps {
    value: string;
    projectId: string;
    handleLayerUpdate: (layers: IncoreLayer[]) => void;
}

export const DatasetEarthquake: React.FC<DatasetEarthquakeProps> = ({ value, projectId, handleLayerUpdate }) => {
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
            const eqJson = await createRjfsDatasetHazards(formData, "earthquakes");
            if (eqJson && eqJson.id) {
                appDispatch(addHazardToProject({ projectId, hazards: [eqJson] }));

                handleLayerUpdate(
                    eqJson.hazardDatasets.map((dataset: HazardDataset) => ({
                        workspace: "incore",
                        layerId: dataset.datasetId,
                        styleName: config.defaultLayerStyles.MapUtil.earthquake
                    }))
                );
            }
        } catch (error) {
            console.error("Error saving earthquake dataset:", error);
        } finally {
            setLoading(false);
            // Reset form by updating the formKey
            setFormKey((prevKey) => prevKey + 1);
        }
    };

    return (
        <TabPanel value={value}>
            <Box sx={{ opacity: loading ? 0.5 : 1 }}>
                <Form
                    key={formKey}
                    schema={DatasetEqSchema}
                    uiSchema={DatasetEqUiSchema}
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
