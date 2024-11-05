interface DatawolfCreator {
    id: string;
    deleted: boolean;
    email: string;
    firstName: string;
    lastName: string;
}

interface DatawolfIO {
    id: string;
    title: string;
    description: string;
    deleted: boolean;
    dataId: string;
    mimeType: string;
}

interface DatawolfToolParameter {
    id: string;
    title: string;
    description: string;
    deleted: boolean;
    type: string;
    parameterId: string;
    value: string;
    hidden: boolean;
    allowNull: boolean;
    options: [];
}

interface DatawolfWorkflowTool {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    version?: string;
    previousVersion?: string;
    date: string;
    implementation: string;
    creator: DatawolfCreator;
    contributors: DatawolfCreator[];
    inputs: DatawolfIO[];
    outputs: DatawolfIO[];
    parameters: DatawolfToolParameter[];
    executor: string;
    blobs: [];
}

interface DatawolfWorkflowFileStep {
    id: string;
    deleted: boolean;
    title: string;
    creator: DatawolfCreator;
    createDate: string;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    inputsToolData: {
        [key: string]: string | null;
    };
    outputsToolData: {
        [key: string]: string | null;
    };
    parameters: {
        [key: string]: string;
    };
    tool: DatawolfWorkflowTool;
}

interface DatawolfWorkflowFile {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    created: string;
    creator: DatawolfCreator;
    contributors: DatawolfCreator[];
    steps: DatawolfWorkflowFileStep[];
}

interface Project {
    id: string;
    name: string;
    description: string;
    creator?: string;
    date?: string;
    owner?: string;
    region: string;
    hazards: Hazard[];
    dfr3Mappings: DFR3Mapping[];
    datasets: Dataset[];
    workflows: Workflow[];
    visualizations: Visualization[];
}

interface ProjectState {
    projects: Project[];
    project: Project | null;
    projectDatasets: Dataset[];
    deletedDatasets: string[];
    projectHazards: Hazard[];
    deletedHazards: string[];
    projectDFR3Mappings: DFR3Mapping[];
    deletedDFR3Mappings: string[];
    projectWorkflows: Workflow[];
    deletedWorkflows: string[];
    projectVisualizations: Visualization[];
    deletedVisualizations: string[];
    loading: boolean;
    error: string | null;
}

interface FileDescriptor {
    id: string;
    deleted: boolean;
    filename: string;
    mimeType: string;
    size: number;
    dataURL: string;
    md5sum: string;
}

interface Dataset {
    id: string;
    deleted: boolean;
    title: string;
    description: string;
    date: string;
    creator: string;
    owner: string;
    spaces: string[];
    contributors: string[];
    fileDescriptors?: FileDescriptor[];
    dataType: string;
    type: string;
    storedUrl: string;
    format: string;
    sourceDataset?: string;
    boundingBox?: [number, number, number, number];
    networkDataset?: string | null;
}

type Rule = string | RuleSet;

interface RuleSet {
    [operator: string]: Rule[];
}

interface MappingRule {
    legacyEntry: Record<string, string>;
    entry: Record<string, string>;
    rules: Rule;
}

interface DFR3Mapping {
    id: string;
    type: string;
    name: string;
    hazardType: string;
    inventoryType: string;
    mappings: MappingRule[];
    creator: string;
    owner: string;
    mappingEntryKeys: string | null;
    spaces: string[];
    mappingType: string;
}

interface Hazard {
    id: string;
    type: string;
    name: string;
    description: string;
    date: string;
    creator: string;
    owner: string;
    hazardDatasets: HazardDataset[];
}

interface HazardDataset {
    datasetId: string;
    demandType: string;
    demandUnits: string;
    threshold: number | null;
}

interface Visualization {
    id: string;
    type: string;
    name: string;
    description: string;
    date: string;
    boundingBox?: number[];
    layers?: Layer[];
    vegaJson?: string;
    sourceDatasetIds?: string[];
}

interface WorkflowCreator {
    id: string;
    deleted: boolean;
    firstName: string;
    lastName: string;
    email: string;
}

interface Workflow {
    id: string;
    type: string;
    isFinalized: boolean;
    deleted: boolean;
    title: string;
    description: string;
    date: string;
    creator: WorkflowCreator;
    contributors: string[];
}
