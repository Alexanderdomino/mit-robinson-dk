import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, CollectionReference, DocumentReference } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { RadlerItem, RadlerReview } from '../models/radler.model';
import { RadlersService } from './radlers.service';

@Injectable()
export class FirestoreRadlersService extends RadlersService implements OnDestroy {
    private colName = 'radlers';
    private radlers$ = new BehaviorSubject<RadlerItem[]>([]);
    private listenerSub?: Subscription;

    constructor(private firestore: Firestore, private ngZone: NgZone) {
        super();
        const col = collection(this.firestore, this.colName);
        const obs = collectionData(col, { idField: 'id' }) as Observable<RadlerItem[]>;
        this.listenerSub = obs.subscribe(list => {
            // Ensure createdAt is number
            const normalized = list.map(it => ({ ...it, createdAt: (it as any).createdAt || Date.now() }));
            this.ngZone.run(() => this.radlers$.next(normalized));
        }, err => console.error('Error subscribing to radlers collection', err));
    }

    getAll(): Observable<RadlerItem[]> {
        return this.radlers$.asObservable();
    }

    getById(id: string): Observable<RadlerItem | undefined> {
        return new Observable<RadlerItem | undefined>(subscriber => {
            const sub = this.radlers$.subscribe(list => {
                subscriber.next(list.find(r => r.id === id));
            }, err => subscriber.error(err), () => subscriber.complete());
            return () => sub.unsubscribe();
        });
    }

    async add(radler: RadlerItem): Promise<string> {
        const col = collection(this.firestore, this.colName);
        const payload = { ...radler } as any;
        if (!payload.createdAt) payload.createdAt = Date.now();
        const ref = await addDoc(col, payload);
        return ref.id;
    }

    async update(id: string, radler: RadlerItem): Promise<void> {
        const d = doc(this.firestore, `${this.colName}/${id}`);
        await updateDoc(d, radler as any);
    }

    async delete(id: string): Promise<void> {
        const d = doc(this.firestore, `${this.colName}/${id}`);
        await deleteDoc(d);
    }

    // Reviews subcollection: radlers/{id}/reviews
    getReviews(radlerId: string): Observable<RadlerReview[]> {
        const col = collection(this.firestore, `${this.colName}/${radlerId}/reviews`);
        return collectionData(col, { idField: 'id' }) as Observable<RadlerReview[]>;
    }

    async addReview(radlerId: string, review: RadlerReview): Promise<string> {
        const col = collection(this.firestore, `${this.colName}/${radlerId}/reviews`);
        const payload = { ...review } as any;
        if (typeof payload.rating !== 'number') payload.rating = 0;
        if (!payload.createdAt) payload.createdAt = Date.now();
        const ref = await addDoc(col, payload);
        return ref.id;
    }

    ngOnDestroy(): void {
        if (this.listenerSub) this.listenerSub.unsubscribe();
    }
}
