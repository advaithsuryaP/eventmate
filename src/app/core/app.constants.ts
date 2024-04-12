import { environment } from '../../environments/environment';

export const API_URL_MAP = {
    EVENTS: `${environment.API_URL}/events`,
    DOMAINS: `${environment.API_URL}/domains`,
    SIGNIN_USER: `${environment.API_URL}/users/signin`,
    SIGNUP_USER: `${environment.API_URL}/users/signup`,
    REGISTER_EVENT: `${environment.API_URL}/register`
};

export const SNACKBAR_ACTION = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
};

export const STORAGE_KEY_MAP = {
    TOKEN: 'token',
    CURRENT_USER: 'currentUser',
    TOKEN_VALID_UNTIL: 'tokenValidUntil'
};
