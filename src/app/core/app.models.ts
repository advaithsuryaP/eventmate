export interface User {
    _id: string;
    email: string;
    username: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
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
    createdAt: string;
    updatedAt: string;
}

export interface Domain {
    _id: string;
    name: string;
    description: string;
    interests: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Registration {
    _id: string;
    userId: string;
    eventId: string;
    domainId: string;
    interests: string[];
    createdAt: string;
    updatedAt: string;
}
