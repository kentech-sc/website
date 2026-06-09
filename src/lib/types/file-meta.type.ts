import type { PostId } from './post.type';
import type { PetitionId } from './petition.type';

export type FileId = string;
export type FileKey = string;

export interface FileMetaCreate {
	key: FileKey;
	name: string;
	size: number;
	mime: string;
	ext: string;
}

export interface FileMetaEntity extends FileMetaCreate {
	_id: FileId;
	articleIds: Array<PostId | PetitionId>;
	createdAt: string;
}

export interface FileMeta extends FileMetaEntity {
	path: string;
}

export type FileMetaUpdate = Partial<Pick<FileMetaEntity, 'articleIds'>>;
