export interface SignUpUserPayload {
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
    isFlagged: boolean;
}

export interface SignInUserPayload {
    email: string;
    password: string;
}

export interface SaveDomainPayload {
    name: string;
    description: string;
    interests: string[];
}

export interface SaveEventPayload {
    image: string;
    title: string;
    description: string;
    creatorId: string;
    domainId: string;
    location: string;
    startDate: Date;
    endDate: Date;
}

export interface RegisterEventPayload {
    userId: string;
    eventId: string;
    domainId: string;
    interests: string[];
    eventMates: string[];
}

export interface GetEventMatesPayload {
    userId: string;
    eventId: string;
    interests: string[];
}

export interface SubmitFeedbackPayload {
    userId: string;
    eventId: string;
    comment: string;
    rating: number;
}

export interface UpdateRegistrationPayload {
    registrationId: string;
    interests: string[];
}
