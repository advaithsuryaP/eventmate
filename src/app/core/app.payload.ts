export interface CreateUserPayload {
    email: string;
    username: string;
    password: string;
}

export interface LoginUserPayload {
    email: string;
    password: string;
}

export interface CreateDomainPayload {
    icon: string;
    name: string;
    description: string;
    interests: string[];
    rank: number;
}

export interface CreateEventPayload {
    image: string;
    title: string;
    description: string;
    domainId: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[];
}

export interface RegisterEventPayload {
    userId: string;
    eventId: string;
    domainId: string;
    interests: string[];
}