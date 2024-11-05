const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.mailingList = "incore-dev@lists.illinois.edu";
config.slackInvitationLink = "https://bit.ly/in-core";
config.tosURL = `${hostname}/doc/incore/termsofservice.html`;
config.hostname = hostname;
config.projectApi = `${hostname}/project/api/projects`;
config.keycloakConfig = {
    authority: `${hostname}/auth/realms/In-core`,
    client_id: "react-auth"
};

export default config;
