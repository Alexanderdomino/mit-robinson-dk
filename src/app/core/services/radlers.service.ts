import { Observable } from 'rxjs';
import { RadlerItem, RadlerReview } from '../models/radler.model';

// Concrete injection token: a class that implementations will extend.
export abstract class RadlersService {
    abstract getAll(): Observable<RadlerItem[]>;
    abstract getById(id: string): Observable<RadlerItem | undefined>;
    abstract add(radler: RadlerItem): Promise<string>;
    abstract update(id: string, radler: RadlerItem): Promise<void>;
    abstract delete(id: string): Promise<void>;

    // Reviews
    abstract getReviews(radlerId: string): Observable<RadlerReview[]>;
    abstract addReview(radlerId: string, review: RadlerReview): Promise<string>;
}
