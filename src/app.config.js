const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.hostname = hostname;
config.projectApi = `${hostname}/project/api/projects`;
config.keycloakConfig = {
    authority: `${hostname}/auth/realms/In-core`,
    client_id: "react-auth"
};

export default config;
