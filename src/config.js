window.API_SERVER = process.env.INCORE_REMOTE_HOSTNAME || "http://localhost:8080";
window.AUTHORITY =
    `${process.env.INCORE_REMOTE_HOSTNAME}/auth/realms/In-core` ||
    "https://incore-dev.ncsa.illinois.edu/auth/realms/In-core";
window.CLIENT_ID = "react-auth";
window.REDIRECT_URI = "http://localhost:3000/";
