const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.mailingList = "incore-dev@lists.illinois.edu";
config.slackInvitationLink = "https://bit.ly/in-core";
config.tosURL = `${hostname}/doc/incore/termsofservice.html`;
config.hostname = hostname;
config.projectApi = `${hostname}/project/api/projects`;
config.datawolfApi = `${hostname}/datawolf`;
config.keycloakConfig = {
    authority: `${hostname}/auth/realms/In-core`,
    client_id: "react-auth"
};

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

export default config;
