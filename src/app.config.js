const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.mailingList = "incore-dev@lists.illinois.edu";
config.slackInvitationLink = "https://bit.ly/in-core";
config.tosURL = `${hostname}/doc/incore/termsofservice.html`;
config.hostname = hostname;
config.docBaseLink = `${hostname}/doc/incore/analyses`;
config.projectApi = `${hostname}/project/api/projects`;
config.spaceApi = `${hostname}/space/api`;
config.hazardApi = `${hostname}/hazard/api`;
config.earthquakeApi = `${config.hazardApi}/earthquakes`;
config.floodApi = `${config.hazardApi}/floods`;
config.hurricaneWindfieldApi = `${config.hazardApi}/hurricaneWindfields`;
config.tornadoApi = `${config.hazardApi}/tornadoes`;
config.tsunamiApi = `${config.hazardApi}/tsunamis`;
config.datawolfApi = `${hostname}/datawolf`;
config.keycloakConfig = {
    authority: `${hostname}/auth/realms/In-core`,
    client_id: "react-auth"
};
config.dataService = `${hostname}/data/api/datasets`;
config.semanticService = `${hostname}/semantics/api/types`;

// TODO replace this with dynamically pulling from GeoServer
config.sytles = [
    "incore:earthquake-pga-g",
    "incore:tornado",
    "incore:hurricane-wave-direction",
    "incore:hurricane-wave-height",
    "incore:hurricane-wave-period",
    "incore:hurricane-wind",
    "incore:hurricane-inundation-depth",
    "incore:hurricane-inundation-duration",
    "incore:hurricane-surge-level",
    "incore:hurricane-water-velocity",
    "incore:heatmap",
    "incore:failure_probability"
];

config.defaultLayerStyles = {
    RetrofitStrategy: "incore:retrofit-rules",
    RetrofitStrategyHighlight: "incore:retrofit-rules-highlight",
    BldgDamage: "incore:galveston-bldg-dmg-fema",
    BldgFunctionality: "incore:bldg-func",
    BldgMCS: "incore:bldg-mcs",
    Interdependency: "incore:substations-label",
    PoleDamage: "incore:epf-dmg-summary",
    PopulationDislocation: "incore:galveston-pop-dis",
    SubstationDamage: "incore:epf-dmg-summary",
    Zone: "incore:polygon",
    MapUtil: {
        earthquake: "incore:earthquake-pga-g",
        tornado: "incore:tornado",
        hurricane: {
            waveHeight: "incore:hurricane-wave-height",
            surgeLevel: "incore:hurricane-surge-level",
            inundationDuration: "incore:hurricane-inundation-duration",
            inundationDepth: "incore:hurricane-inundation-depth",
            wavePeriod: "incore:hurricane-wave-period",
            waveDirection: "incore:hurricane-wave-direction",
            waterVelocity: "incore:hurricane-water-velocity",
            windVelocity: "incore:hurricane-wind"
        },
        tsunami: {},
        floods: {}
    }
};

config.VALID_MAP_BOUNDS = [-180.0, -90, 180.0, 90];
config.DEFAULT_MAP_BOUNDS = [-125.0, 24.396308, -66.93457, 49.384358];
config.DEFAULT_MAP_CENTER = [39.8283, -98.5795];
config.basemapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default config;
