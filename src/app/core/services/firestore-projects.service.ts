import { Injectable, NgZone } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectsService } from './projects.service';

@Injectable()
export class FirestoreProjectsService extends ProjectsService {
    private colName = 'projects';
    private projects$ = new BehaviorSubject<Project[]>([]);
    private listenerSub?: Subscription;

    constructor(private firestore: Firestore, private ngZone: NgZone) {
        super();
        // subscribe once to keep a local cache so lookups by id are instant
        const col = collection(this.firestore, this.colName);
        const obs = collectionData(col, { idField: 'id' }) as Observable<Project[]>;
        this.listenerSub = obs.subscribe(list => {
            this.ngZone.run(() => this.projects$.next(list));
        }, err => {
            console.error('Error subscribing to projects collection', err);
        });
    }

    getAll(): Observable<Project[]> {
        return this.projects$.asObservable();
    }

    getById(id: string): Observable<Project | undefined> {
        return new Observable<Project | undefined>(subscriber => {
            const sub = this.projects$.subscribe(list => {
                const found = list.find(p => p.id === id);
                subscriber.next(found);
            }, err => subscriber.error(err), () => subscriber.complete());
            return () => sub.unsubscribe();
        });
    }

    async add(project: Project): Promise<string> {
        const col = collection(this.firestore, this.colName);
        const ref = await addDoc(col, project as any);
        return ref.id;
    }

    async update(id: string, project: Project): Promise<void> {
        const d = doc(this.firestore, `${this.colName}/${id}`);
        await updateDoc(d, project as any);
    }

    async delete(id: string): Promise<void> {
        const d = doc(this.firestore, `${this.colName}/${id}`);
        await deleteDoc(d);
    }

    ngOnDestroy(): void {
        if (this.listenerSub) this.listenerSub.unsubscribe();
    }
}
