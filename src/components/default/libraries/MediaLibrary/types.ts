export type View = 'image' | 'video' | 'file' | 'audio';

export interface IFolder {
  id: number;
  slug: string;
  name: string;
  createdAt: string;
  parentFolder: IFolder | null;
  folders: IFolder[];
  assets: number;
}

export interface IAsset {
  id: number;
  name: string;
  type: View;
  url: string;
  size: number;
  createdAt: string;
}
