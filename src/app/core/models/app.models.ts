export interface Event {
    _id: string;
    image: string;
    title: string;
    description: string;
    domain: Domain; // foreign key
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[];
}

export interface Domain {
    _id: string;
    name: string;
    description: string;
    interests: string[];
    rank: number;
}
