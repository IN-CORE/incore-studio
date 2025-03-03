import React, { useState } from "react";
import { TabPanel, Box, Button, Skeleton } from "@mui/joy";
import { useAppDispatch } from "@app/store/hooks";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { createRjfsDatasetHazards } from "@app/utils";
import { addHazardToProject } from "@app/reducer/projectSlice";
import Form from "@rjsf/mui";
import DatasetFloodSchema from "@app/schema/tornado/datasetTornado.json";
import DatasetFloodUiSchema from "@app/schema/tornado/datasetTornadoUi.json";
import validator from "@rjsf/validator-ajv8";

interface DatasetTornadoProps {
    index: number;
    projectId: string;
    handleLayerUpdate: (hazardType: string) => void;
}

export const DatasetTornado: React.FC<DatasetTornadoProps> = ({ index, projectId, handleLayerUpdate }) => {
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
            const tornadoJson = await createRjfsDatasetHazards(formData, "tornadoes");
            if (tornadoJson && tornadoJson.id) {
                appDispatch(addHazardToProject({ projectId, hazards: [tornadoJson] }));
                handleLayerUpdate(tornadoJson.id);
            }
        } catch (error) {
            console.error("Error saving tornado dataset:", error);
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
                    <Box>
                        <Button variant="solid" type="submit">
                            Save
                        </Button>
                    </Box>
                </Form>
            )}
        </TabPanel>
    );
};
