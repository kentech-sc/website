import mongoose from 'mongoose';

// MongoDB 초기화
export async function init(MONGO_URI: string) {
	await mongoose.connect(MONGO_URI);
	mongoose.set('transactionAsyncLocalStorage', true);
}

// MongoDB data 백업: 전체 문서를 JSON 문자열로 반환
export async function getBackupFromModel<T>(DBModel: mongoose.Model<T>): Promise<string> {
	const data = await DBModel.find().lean();
	return JSON.stringify(data);
}
