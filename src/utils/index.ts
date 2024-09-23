import { User } from "oidc-client";

export function getOidcUser() {
    const oidcStorage = sessionStorage.getItem(`oidc.user:${window.AUTHORITY}:${window.CLIENT_ID}`);
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

export const getHeaders = () => {
    const user = getOidcUser(); // Assuming this function retrieves the user object with the access token
    const token = user?.access_token;
    const isLocalhost = window.API_SERVER.includes("localhost");

    if (!isLocalhost) {
        return {
            Authorization: `Bearer ${token}`
        };
    }

    return {
        "x-auth-userinfo": JSON.stringify({ preferred_username: user?.profile?.preferred_username }),
        "x-auth-usergroup": JSON.stringify({ groups: user?.profile?.groups })
    };
};
