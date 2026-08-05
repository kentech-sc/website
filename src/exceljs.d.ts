declare module '@excel.js/exceljs' {
	interface Cell {
		readonly text: string;
	}

	interface Row {
		getCell(index: number): Cell;
	}

	interface Worksheet {
		eachRow(
			options: { includeEmpty: boolean },
			callback: (row: Row, rowNumber: number) => void
		): void;
	}

	interface Workbook {
		readonly worksheets: Worksheet[];
		readonly xlsx: {
			load(data: Buffer): Promise<Workbook>;
		};
	}

	const ExcelJS: { Workbook: new () => Workbook };
	export default ExcelJS;
}
