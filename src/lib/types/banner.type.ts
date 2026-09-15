/** DB 에서 그대로 읽어온 배너. 파일은 아직 키로만 들고 있다. */
export interface BannerRow {
	id: string;
	fileId: string;
	/** 배너를 눌렀을 때 이동할 주소. 없으면 링크 없는 이미지로 보여준다. */
	linkUrl: string | null;
	/** 메인 슬라이드에 나오는지. 여러 개가 동시에 켜질 수 있다. */
	isActive: boolean;
	/** 슬라이드 순서. 작을수록 먼저 나온다. */
	position: number;
	fileName: string;
	fileKey: string;
}

/** 화면에 내려보내는 배너. 파일 키를 공개 URL 로 바꾼 형태. */
export interface Banner {
	id: string;
	fileId: string;
	linkUrl: string | null;
	isActive: boolean;
	position: number;
	imagePath: string;
	imageAlt: string;
}
