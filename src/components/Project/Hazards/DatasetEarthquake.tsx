import React, { useState } from "react";
import { Box, Button, Skeleton, TabPanel } from "@mui/joy";
import Form from "@rjsf/mui";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import DatasetEqSchema from "@app/schema/earthquake/datasetEarthquake.json";
import DatasetEqUiSchema from "@app/schema/earthquake/datasetEarthquakeUi.json";
import { addHazardToProject } from "@app/reducer/projectSlice";
import { createRjfsDatasetHazards } from "@app/utils";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv6";
import { useAppDispatch } from "@app/store/hooks";

// Define props type
interface DatasetEarthquakeProps {
    index: number;
    projectId: string;
    onAddClick: (data: any) => void;
    onClose: () => void;
    handleLayerUpdate: (hazardType: string) => void;
}

export const DatasetEarthquake: React.FC<DatasetEarthquakeProps> = ({
    index,
    projectId,
    onAddClick,
    onClose,
    handleLayerUpdate
}) => {
    const [loading, setLoading] = useState<boolean>(false);

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
                handleLayerUpdate(eqJson.id);
            }
        } catch (error) {
            console.error("Error saving earthquake dataset:", error);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <TabPanel value={index}>
            {loading ? (
                <Skeleton variant="rectangular" width="100%" height={200} className="rounded-md" />
            ) : (
                <Form
                    schema={DatasetEqSchema}
                    uiSchema={DatasetEqUiSchema}
                    widgets={widgets}
                    validator={validator}
                    onSubmit={({ formData }) => onSave(formData)}
                >
                    <Box className="inputGroup">
                        <Button variant="solid" type="submit" onClick={onAddClick}>
                            Save
                        </Button>
                    </Box>
                </Form>
            )}
        </TabPanel>
    );
};
