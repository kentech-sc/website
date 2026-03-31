import type { Types, UpdateQuery } from 'mongoose';
import type { PostId } from './post.type';
import type { PetitionId } from './petition.type';

export type FileId = Types.ObjectId;
export type FileKey = string;

export interface FileMetaCreate {
	key: FileKey;
	name: string;
	size: number;
	mime: string;
	ext: string;
}

export interface FileMetaDoc extends FileMetaCreate {
	_id: FileId;
	articleIds: Array<PostId | PetitionId>;
	createdAt: Date;
}

export interface FileMeta extends FileMetaDoc {
	path: string;
}

export type FileMetaUpdate = UpdateQuery<Pick<FileMetaDoc, 'articleIds'>>;
