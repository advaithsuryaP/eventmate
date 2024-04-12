import { environment } from '../../../environments/environment';

export const API_URL_MAP = {
    EVENTS: `${environment.API_URL}/events`,
    DOMAINS: `${environment.API_URL}/domains`,
    SIGNIN_USER: `${environment.API_URL}/users/signin`,
    SIGNUP_USER: `${environment.API_URL}/users/signup`,
    REGISTER_EVENT: `${environment.API_URL}/register`
};
