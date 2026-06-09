import mongoose from 'mongoose';

export async function init(MONGO_URI: string) {
	await mongoose.connect(MONGO_URI);
	mongoose.set('transactionAsyncLocalStorage', true);
}

export async function getBackupFromModel<T>(DBModel: mongoose.Model<T>): Promise<string> {
	const data = await DBModel.find().lean();
	return JSON.stringify(data);
}
