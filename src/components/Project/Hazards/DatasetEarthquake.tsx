import React, { useState } from "react";
import { Box, Button, Skeleton, TabPanel } from "@mui/joy";
import Form from "@rjsf/mui";
// import { useSelector } from "react-redux";
import { CustomSelectWidget } from "@app/components/StyledComponents/CustomSelectWidget";
import { CustomTextInput } from "@app/components/StyledComponents/CustomTextWidget";
import DatasetEqSchema from "@app/schema/earthquake/datasetEarthquake.json";
import DatasetEqUiSchema from "@app/schema/earthquake/datasetEarthquakeUi.json";
// import { addHazardToProject } from "@app/reducer/projectSlice";
// import { createRjfsDatasetHazards } from "../../../utils/hazard";
import { RegistryWidgetsType, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv6";

// Define props type
interface DatasetEarthquakeProps {
    index: number;
    projectId: string;
    onAddClick: (data: any) => void;
    // handleListUpdate: (config: any, hazardType: string) => void;
}

export const DatasetEarthquake: React.FC<DatasetEarthquakeProps> = ({
    index,
    projectId,
    onAddClick
    // handleListUpdate,
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const widgets: RegistryWidgetsType<any, RJSFSchema, any> = {
        TextWidget: CustomTextInput as React.FC<any>,
        SelectWidget: CustomSelectWidget as React.FC<any>
    };

    // Function to handle save
    const onSave = async (formData: Record<string, any>) => {
        setLoading(true);
        console.log("formData", formData);
        console.log("projectId", projectId);
        // try {
        // const eqJson = await createRjfsDatasetHazards(globalConfig, formData, "earthquakes");
        // if (eqJson && eqJson.id) {
        //     // appDispatch(addHazardToProject({ projectId, hazards: [resource] }));
        //     handleLayerUpdate(eqJson);
        //     handleListUpdate(globalConfig, "earthquake");
        // }
        // } catch (error) {
        //     console.error("Error saving earthquake dataset:", error);
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <TabPanel value={index}>
            <Skeleton loading={loading} variant="overlay">
                <img
                    alt=""
                    src={
                        loading
                            ? "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                            : "https://images.unsplash.com/photo-1686548812883-9d3777f4c137?h=400&fit=crop&auto=format&dpr=2"
                    }
                />
            </Skeleton>
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
        </TabPanel>
    );
};
