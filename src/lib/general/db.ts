import mongoose from 'mongoose';

export default class DBManager {
	static async init(WIKI_MONGO_URI: string) {
		await mongoose.connect(WIKI_MONGO_URI);
		mongoose.set('transactionAsyncLocalStorage', true);
	}

	static async getBackupFromModel<T>(DBModel: mongoose.Model<T>) {
		const data = await DBModel.find().lean();
		return JSON.stringify(data);
	}
}
