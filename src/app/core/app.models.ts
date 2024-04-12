export interface CurrentUser {
    userId: string;
    email: string;
    username: string;
    events: string[];
    token: string;
    expiresIn: number;
}

export interface Event {
    _id: string;
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

export interface Domain {
    _id: string;
    icon: string;
    name: string;
    description: string;
    interests: string[];
    rank: number;
}

export interface Registration {
    _id: string;
    userId: string;
    eventId: string;
    domainId: string;
    interests: string[];
}