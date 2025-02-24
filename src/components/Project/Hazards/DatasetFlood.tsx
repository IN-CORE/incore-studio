import React, { useState } from "react";
import { useAppDispatch } from "@app/store/hooks";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { createRjfsDatasetHazards } from "@app/utils";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { Box, Button, Skeleton, TabPanel } from "@mui/joy";
import Form from "@rjsf/mui";
import DatasetFloodSchema from "@app/schema/flood/datasetFlood.json";
import DatasetFloodUiSchema from "@app/schema/flood/datasetFloodUi.json";
import validator from "@rjsf/validator-ajv8";

interface DatasetFloodProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (hazardType: string) => void;
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
                handleLayerUpdate(floodJson.id);
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
            {loading ? (
                <Skeleton variant="rectangular" width="100%" height={200} className="rounded-md" />
            ) : (
                <Form
                    key={formKey}
                    schema={DatasetFloodSchema}
                    uiSchema={DatasetFloodUiSchema}
                    widgets={widgets}
                    validator={validator}
                    onSubmit={({ formData }) => onSave(formData)}
                >
                    <Box className="inputGroup">
                        <Button variant="solid" type="submit">
                            Save
                        </Button>
                    </Box>
                </Form>
            )}
        </TabPanel>
    );
};
