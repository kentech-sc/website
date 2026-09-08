/** DB 에서 그대로 읽어온 배너. 파일은 아직 키로만 들고 있다. */
export interface BannerRow {
	id: string;
	fileId: string;
	/** 배너를 눌렀을 때 이동할 주소. 없으면 링크 없는 이미지로 보여준다. */
	linkUrl: string | null;
	/** 메인에 걸려 있는 배너인지. 보관함에서 항상 하나만 true 다. */
	isActive: boolean;
	fileName: string;
	fileKey: string;
}

/** 화면에 내려보내는 배너. 파일 키를 공개 URL 로 바꾼 형태. */
export interface Banner {
	id: string;
	fileId: string;
	linkUrl: string | null;
	isActive: boolean;
	imagePath: string;
	imageAlt: string;
}
