import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

// Concrete injection token: a class that implementations will extend.
export abstract class ProjectsService {
    abstract getAll(): Observable<Project[]>;
    abstract getById(id: string): Observable<Project | undefined>;
    abstract add(project: Project): Promise<string>;
    abstract update(id: string, project: Project): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
