import type { Types } from 'mongoose';

export type FileId = Types.ObjectId;
export type FileKey = string;

export interface FileMetaBase {
	key: FileKey;
	name: string;
	size: number;
	mime: string;
	ext: string;
}

export interface FileMeta extends FileMetaBase {
	_id: FileId;
	createdAt: Date;

	path?: string;
}

export type FileMetaCreate = FileMetaBase;
