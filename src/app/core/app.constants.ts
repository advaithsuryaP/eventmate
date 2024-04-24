import { environment } from '../../environments/environment';

export const API_URL_MAP = {
    USERS: `${environment.API_URL}/users`,
    EVENTS: `${environment.API_URL}/events`,
    DOMAINS: `${environment.API_URL}/domains`,
    FEEDBACKS: `${environment.API_URL}/feedbacks`,
    GET_USER_FEEDBACK: `${environment.API_URL}/feedbacks/user`,
    GET_EVENT_FEEDBACK: `${environment.API_URL}/feedbacks/event`,
    SIGNIN_USER: `${environment.API_URL}/users/signin`,
    SIGNUP_USER: `${environment.API_URL}/users/signup`,
    REGISTRATIONS: `${environment.API_URL}/registrations`,
    UPDATE_REGISTRATION: `${environment.API_URL}/registrations/update-registration`,
    GET_EVENTMATES_RECOMMENDATIONS: `${environment.API_URL}/registrations/get-eventmate-recommendations`
};

export const SNACKBAR_ACTION = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
};

export const ERROR_CODE_MAP = {
    backendUnavailable: 'backendUnavailable'
};

export const STORAGE_KEY_MAP = {
    TOKEN: 'token',
    CURRENT_USER: 'currentUser',
    TOKEN_VALID_UNTIL: 'tokenValidUntil'
};
