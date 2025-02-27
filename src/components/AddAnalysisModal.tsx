import React from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Checkbox,
    List,
    ListItem,
    IconButton,
    Input,
    Modal,
    ModalClose,
    Stack,
    Typography
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Done from "@mui/icons-material/Done";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useShallow } from "zustand/react/shallow";

import { useAppSelector } from "@app/store/hooks";
import Loading from "./Loading";
import { getNodeFromToolV2 } from "@app/components/Workflow/workflowUtils";
import useStore, { type ReactFlowAppState } from "./Workflow/reactFlowStore";

interface AddAnalysisModalProps {
    selectAnalysisModalOpen: boolean;
    setSelectAnalysisModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const selector = (state: ReactFlowAppState) => ({
    addNodes: state.addNodes
});

const AddAnalysisModal = ({ selectAnalysisModalOpen, setSelectAnalysisModalOpen }: AddAnalysisModalProps) => {
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<string>("");
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);

    const { addNodes } = useStore(useShallow(selector));
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);
    // const loading = useAppSelector((state) => state.workflow.loading);

    const clearItems = () => {
        setSelectedAnalysis("");
        setSearchAnalysisTerm("");
        setSelectAnalysisModalOpen(false);
    };

    React.useEffect(() => {
        if (datawolfTools.length !== 0 && dependencyGraph !== null) {
            let toolNames = datawolfTools.map((tool) => tool.title).sort();
            toolNames = toolNames
                .filter((tool) => dependencyGraph[tool] !== undefined)
                .filter(
                    (tool) =>
                        dependencyGraph[tool].pretty_name.toLowerCase().search(searchAnalysisTerm.toLowerCase()) !== -1
                );
            setAvailableAnalyses(toolNames);
        }
    }, [datawolfTools, searchAnalysisTerm]);

    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={selectAnalysisModalOpen}
            onClose={() => setSelectAnalysisModalOpen(false)}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <Card
                sx={{
                    width: 800,
                    maxHeight: 800,
                    backgroundColor: "white",
                    padding: "24px"
                }}
            >
                <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <TrendingUpRoundedIcon sx={{ color: "#EF6C00", marginRight: "10px" }} />
                    <Typography
                        level="title-lg"
                        sx={{
                            fontWeight: 500,
                            fontSize: "24px",
                            lineHeight: "24px",
                            paragraph: "28px",
                            my: "10px"
                        }}
                    >
                        Select Analysis
                    </Typography>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                </Box>
                <CardContent>
                    <Stack direction="column" spacing={3}>
                        <Box>
                            <Input
                                startDecorator={<SearchRoundedIcon />}
                                endDecorator={
                                    searchAnalysisTerm.length > 0 ? (
                                        <IconButton variant="plain" onClick={() => setSearchAnalysisTerm("")}>
                                            <CloseRoundedIcon />
                                        </IconButton>
                                    ) : null
                                }
                                placeholder="Search Analysis"
                                value={searchAnalysisTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSearchAnalysisTerm(e.target.value.toLowerCase());
                                }}
                            />
                        </Box>
                        <Box sx={{ height: "400px", overflow: "auto", padding: "10px" }}>
                            <List
                                sx={{
                                    "--List-gap": "8px",
                                    "--ListItem-minHeight": "32px",
                                    "--ListItem-gap": "4px"
                                }}
                            >
                                {dependencyGraph !== null &&
                                    availableAnalyses.map((analysis) => (
                                        <ListItem key={analysis}>
                                            {analysis === selectedAnalysis && (
                                                <Done
                                                    color="primary"
                                                    sx={{
                                                        ml: -0.5,
                                                        zIndex: 2,
                                                        pointerEvents: "none"
                                                    }}
                                                />
                                            )}
                                            <Checkbox
                                                size="sm"
                                                disableIcon
                                                overlay
                                                label={dependencyGraph[analysis].pretty_name}
                                                checked={selectedAnalysis === analysis}
                                                variant={selectedAnalysis === analysis ? "soft" : "outlined"}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    if (event.target.checked) {
                                                        setSelectedAnalysis(analysis);
                                                    } else {
                                                        setSelectedAnalysis("");
                                                    }
                                                }}
                                                slotProps={{
                                                    action: ({ checked }) => ({
                                                        sx: checked
                                                            ? {
                                                                  border: "1px solid",
                                                                  borderColor: "primary.500"
                                                              }
                                                            : {}
                                                    })
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                            </List>
                            {datawolfTools.length === 0 && <Loading />}
                        </Box>
                    </Stack>
                </CardContent>
                <CardActions>
                    <Button
                        variant="solid"
                        sx={{ backgroundColor: "primary.main" }}
                        startDecorator={<AddRoundedIcon />}
                        onClick={() => {
                            if (selectedAnalysis !== "") {
                                const newNode = getNodeFromToolV2(
                                    datawolfTools.find((tool) => tool.title === selectedAnalysis),
                                    dependencyGraph
                                );
                                if (newNode !== null) {
                                    addNodes([newNode]);
                                }
                                clearItems();
                            }
                        }}
                    >
                        Add
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
};

export default AddAnalysisModal;
