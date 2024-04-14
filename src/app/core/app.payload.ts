export interface SignUpUserPayload {
    email: string;
    username: string;
    password: string;
}

export interface SignInUserPayload {
    email: string;
    password: string;
}

export interface CreateDomainPayload {
    icon: string;
    name: string;
    description: string;
    interests: string[];
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

export interface FetchEventsPayload {
    userId?: string;
    eventId?: string;
}
