import type { Types, UpdateQuery } from 'mongoose';

export type FileId = Types.ObjectId;
export type FileKey = string;

export interface FileMetaCreate {
	key: FileKey;
	name: string;
	size: number;
	mime: string;
	ext: string;
	isTemp: boolean;
}

export interface FileMetaDoc extends FileMetaCreate {
	_id: FileId;
	createdAt: Date;
}

export interface FileMeta extends FileMetaDoc {
	path: string;
}

export type FileMetaUpdate = UpdateQuery<Pick<FileMetaDoc, 'isTemp'>>;
