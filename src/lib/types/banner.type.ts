/** 메인 화면에 걸리는 배너. 한 번에 하나만 존재한다. */
export interface Banner {
	id: string;
	fileId: string;
	/** 배너를 눌렀을 때 이동할 주소. 없으면 링크 없는 이미지로 보여준다. */
	linkUrl: string | null;
	imagePath: string;
	imageAlt: string;
}
