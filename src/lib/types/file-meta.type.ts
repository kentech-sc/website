import type { Types } from 'mongoose';

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
	createdAt: Date;
}

export interface FileMeta extends FileMetaDoc {
	path: string;
}
