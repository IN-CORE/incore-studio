window.API_SERVER = process.env.INCORE_REMOTE_HOSTNAME || window.location.origin;
window.AUTHORITY = `${window.API_SERVER}/auth/realms/In-core`;
window.CLIENT_ID = "react-auth";
