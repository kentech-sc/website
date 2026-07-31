# Object storage 이전 가이드

3차 목표는 기존 AWS S3 객체를 Cloudflare R2로 복사하고, 애플리케이션의 저장소를 R2로 전환하는 것이다.
환경변수에는 공급자 이름을 넣지 않는다.

- `STORAGE_*`: 이전 대상이자 이전 완료 후 애플리케이션이 사용할 저장소
- `STORAGE_SOURCE_*`: 일회성 이전 원본. 이전이 끝나면 삭제

이전 중에도 `file_metas.key`는 유지하므로 `post_files`와 `petition_files` 관계는 바뀌지 않는다.

## 1. R2 준비

Cloudflare Dashboard에서 다음을 준비한다.

1. R2 bucket을 생성한다.
2. 해당 bucket으로 범위를 제한한 Object Read & Write API token을 생성한다.
3. 공개 파일 조회에 사용할 custom domain을 연결한다.
4. custom domain을 통해 bucket 객체를 읽을 수 있는지 확인한다.

Production에서는 임시 `r2.dev` 주소보다 서비스 소유의 custom domain을 권장한다.

## 2. 환경변수 설정

`secure-s3-storage@3.0.1`의 endpoint는 bucket 이름까지 포함한 정확한 bucket endpoint다.

대상이자 향후 runtime 저장소인 R2 설정:

```dotenv
STORAGE_BUCKET=<R2 bucket 이름>
STORAGE_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<R2 bucket 이름>
STORAGE_PUBLIC_BASE_URL=https://files.example.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=<R2 access key ID>
STORAGE_SECRET_ACCESS_KEY=<R2 secret access key>
STORAGE_SESSION_TOKEN=
MAX_FILE_SIZE=<기존 값>
```

일회성 원본 저장소인 AWS S3 설정:

```dotenv
STORAGE_SOURCE_BUCKET=<기존 S3 bucket 이름>
STORAGE_SOURCE_ENDPOINT=https://<기존 S3 bucket 이름>.s3.<region>.amazonaws.com
STORAGE_SOURCE_REGION=<기존 S3 region>
STORAGE_SOURCE_ACCESS_KEY_ID=<기존 AWS access key ID>
STORAGE_SOURCE_SECRET_ACCESS_KEY=<기존 AWS secret access key>
STORAGE_SOURCE_SESSION_TOKEN=
```

`DIRECT_DATABASE_URL`은 `file_metas`와 본문 데이터가 들어 있는 이전 대상 Supabase DB를 가리켜야 한다.

## 3. Dry run

```bash
npm run storage:migrate
```

스크립트는 PostgreSQL의 `app.file_metas`를 파일 manifest로 사용한다. 따라서 원본 credential에
`ListBucket` 권한은 필요하지 않다. 각 파일에 대한 읽기 권한은 필요하다.

출력에서 다음을 확인한다.

- PostgreSQL project reference가 의도한 Supabase project인지
- manifest 파일 개수가 예상과 같은지
- source와 target bucket 이름이 맞는지
- embedded image와 갱신 대상 본문 개수가 예상과 같은지
- 마지막에 `Validation passed`가 출력되는지

Dry run은 객체나 DB를 변경하지 않는다.

## 4. 복사 및 검증

Dry run에 출력된 project reference를 사용한다.

```bash
npm run storage:migrate -- --execute --confirm-target=<supabase-project-ref>
```

스크립트는 다음 순서로 실행된다.

1. `file_metas`의 모든 원본 객체와 크기를 확인한다.
2. 같은 key로 대상 저장소에 복사한다.
3. 원본과 대상 객체의 SHA-256을 비교한다.
4. 공개 URL에서도 파일을 내려받아 SHA-256을 다시 확인한다.
5. 모든 객체가 검증된 뒤 본문의 이미지 URL과 `data-file-id`를 PostgreSQL transaction으로 갱신한다.

실패하면 원인을 해결하고 같은 명령을 다시 실행해도 된다. 이미 동일한 대상 객체는 재사용하며 원본 객체는 삭제하지 않는다.

## 5. 애플리케이션 검증과 배포

이미 `STORAGE_*`가 R2를 가리키므로 별도의 환경변수 이름 변경은 필요 없다. 로컬 또는 Vercel Preview에서
다음을 확인한다.

- 기존 첨부 파일과 본문 이미지가 표시되는지
- 다운로드 URL이 새 public domain을 사용하는지
- 새 이미지와 문서 업로드가 R2에 저장되는지
- 글 작성, 수정, 파일 삭제가 정상인지
- DB의 `file_metas.key` 형식이 유지되는지

검증 후 Vercel Production에 같은 `STORAGE_*` 값을 설정하고 배포한다.

## 6. 롤백과 정리

문제가 생기면 `STORAGE_*`를 기존 저장소의 bucket, endpoint, public URL, region, credential로 되돌려
재배포할 수 있다. 단, 본문 URL은 새 public domain으로 갱신되므로 롤백 기간에는 R2 bucket과 custom
domain도 유지한다.

충분한 검증 기간이 지나면 다음을 정리한다.

- 로컬/Vercel에서 `STORAGE_SOURCE_*` 삭제
- 이전 스크립트와 `storage:migrate` 명령 제거 여부 결정
- 보존 정책을 확인한 뒤 기존 S3 bucket과 credential 정리

최종 runtime 환경에는 `STORAGE_*`만 남는다.
