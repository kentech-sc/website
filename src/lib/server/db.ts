import mongoose from 'mongoose';

export async function init(MONGO_URI: string) {
	await mongoose.connect(MONGO_URI);
	mongoose.set('transactionAsyncLocalStorage', true);
}
