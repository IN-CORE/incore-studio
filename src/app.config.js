const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.mailingList = "incore-dev@lists.illinois.edu";
config.slackInvitationLink = "https://bit.ly/in-core";
config.tosURL = `${hostname}/doc/incore/termsofservice.html`;
config.hostname = hostname;
config.docBaseLink = `${hostname}/doc/incore/analyses`;
config.projectApi = `${hostname}/project/api/projects`;
config.toolsApi = `${hostname}/project/api/tools`;
config.spaceApi = `${hostname}/space/api`;
config.hazardApi = `${hostname}/hazard/api`;
config.dataApi = `${hostname}/data/api`;
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
config.styles = {
    "Inventory": [
        "studio:building",
        "studio:substations-label",
        "studio:joplin-bldg-substations",
        "studio:point-red",
        "studio:point-green",
        "studio:point-blue",
        "studio:point-black",
        "studio:point-white",
        "studio:point-gray"
    ],
    "Damage Analysis": ["studio:bldg-dmg", "studio:galveston-bldg-dmg-fema", "studio:epf-dmg-summary"],
    "Functionality": ["studio:bldg-func", "studio:joplin-bldg-func", "studio:bldg-mcs"],
    "Population Dislocation": ["studio:joplin-pop-dis", "studio:galveston-pop-dis", "studio:slc-pop-dis"],
    "Mean Damage": ["studio:mean-damage"],
    "Economic Loss": ["studio:economic-loss"],
    "Flood": ["studio:water-depth"],
    "Hurricane": [
        "studio:hurricane-wave-height",
        "studio:hurricane-surge-level",
        "studio:hurricane-inundation-duration",
        "studio:hurricane-inundation-depth",
        "studio:hurricane-wave-period",
        "studio:hurricane-wave-direction",
        "studio:hurricane-water-velocity",
        "studio:hurricane-wind"
    ],
    "Tsunami": ["studio:tsunami"],
    "Earthquake": ["studio:earthquake-pga-g"],
    "Tornado": ["studio:tornado", "studio:tornado1"],
    "Retrofit": ["studio:retrofit-rules", "studio:retrofit-rules-highlight"],
    "Zone": ["studio:zone"]
};

config.defaultLayerStyles = {
    MapUtil: {
        earthquake: "studio:earthquake-pga-g",
        tornado: "studio:tornado",
        hurricane: {
            waveHeight: "studio:hurricane-wave-height",
            surgeLevel: "studio:hurricane-surge-level",
            inundationDuration: "studio:hurricane-inundation-duration",
            inundationDepth: "studio:hurricane-inundation-depth",
            wavePeriod: "studio:hurricane-wave-period",
            waveDirection: "studio:hurricane-wave-direction",
            waterVelocity: "studio:hurricane-water-velocity",
            windVelocity: "studio:hurricane-wind"
        },
        tsunami: "studio:tsunami",
        flood: {
            inundationDepth: "studio:water-depth",
            waterSurfaceElevation: "studio:water-depth"
        }
    }
};

config.VALID_MAP_BOUNDS = [-180.0, -90, 180.0, 90];
config.DEFAULT_MAP_BOUNDS = [-125.0, 24.396308, -66.93457, 49.384358];
config.DEFAULT_MAP_CENTER = [-98.5795, 39.8283];
config.basemapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
config.DEFAULT_MAP_ZOOM = 10;

export default config;
