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
    domainId: string; // foreign key
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[];
}
