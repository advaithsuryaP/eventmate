export interface User {
    _id: string;
    email: string;
    username: string;
    isAdmin: boolean;
    isFlagged: boolean;
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
    startDate: Date;
    endDate: Date;
    adminId: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;

    // frontend paramaters
    eventStartsIn: number; // Days remaining for the event to start
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

export interface Feedback {
    id: string;
    userId: string;
    eventId: string;
    comment: string;
    rating: number;
}
