import { User } from "oidc-client";
import config from "@app/app.config";

export function getOidcUser() {
    const oidcStorage = sessionStorage.getItem(
        `oidc.user:${config.keycloakConfig.authority}:${config.keycloakConfig.client_id}`
    );
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

export const getHeaders = () => {
    const user = getOidcUser(); // Assuming this function retrieves the user object with the access token
    const token = user?.access_token;
    const isLocalhost = config.hostname.includes("localhost");

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

export function parseDateTime(dateString: string) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone
    };

    const mydate = new Date(dateString);

    // @ts-ignore
    return mydate.toLocaleString("en-US", options);
}
