import { environment } from '../../../environments/environment';

export const API_URL_MAP = {
    EVENTS: `${environment.API_URL}/events`,
    DOMAINS: `${environment.API_URL}/domains`,
    REGISTER_USER: `${environment.API_URL}/users/register`
};
