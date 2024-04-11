import { environment } from '../../../environments/environment';

export const API_URL_MAP = {
    EVENTS: `${environment.API_URL}/events`,
    DOMAINS: `${environment.API_URL}/domains`,
    LOGIN_USER: `${environment.API_URL}/users/login`,
    REGISTER_USER: `${environment.API_URL}/users/register`
};
