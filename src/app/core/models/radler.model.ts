export interface RadlerReview {
    id?: string;
    rating: number; // 0-5
    comment?: string;
    user?: string;
    createdAt: number; // epoch millis
}

export interface RadlerItem {
    id?: string;
    title: string;
    beer: string;
    mixer: string; // the other beverage
    imageUrl?: string;
    createdAt: number; // epoch millis
}
