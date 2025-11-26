// Repository Layer에서 발생한 오류
export class RepoError extends Error {
	constructor(message: string) {
		super(message);
	}
}

// Service Layer에서 발생한 오류
export class ServiceError extends Error {
	constructor(message: string) {
		super(message);
	}
}

// Application Layer에서 발생한 오류
export class AppError extends Error {
	constructor(message: string) {
		super(message);
	}
}
