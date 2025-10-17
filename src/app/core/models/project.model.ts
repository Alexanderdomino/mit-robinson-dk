export interface ProjectImage {
    url: string;
    order: number; // lower numbers appear first
    // client-side only: when user selects a file before upload
    file?: File;
    // data URL for preview in the editor
    preview?: string;
}

export interface Project {
    id?: string;
    title: string;
    description: string;
    images?: ProjectImage[]; // first image (lowest order) is treated as thumbnail
}
