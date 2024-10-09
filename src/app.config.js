const config = {};
const hostname = process.env.INCORE_REMOTE_HOSTNAME || "";

config.mailingList = "incore-dev@lists.illinois.edu";
config.slackInvitationLink = "https://bit.ly/in-core";
config.tosURL = `${hostname}/doc/incore/termsofservice.html`;

export default config;
