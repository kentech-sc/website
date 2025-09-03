import mongoose from 'mongoose';

export default class DBService {
	static async init(MONGO_URI: string) {
		await mongoose.connect(MONGO_URI);
		mongoose.set('transactionAsyncLocalStorage', true);
	}

	static async getBackupFromModel<T>(DBModel: mongoose.Model<T>) {
		const data = await DBModel.find().lean();
		return JSON.stringify(data);
	}
}
