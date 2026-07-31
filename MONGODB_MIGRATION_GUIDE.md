# MongoDB → PostgreSQL 데이터 이전

이 작업은 애플리케이션 스키마 마이그레이션을 적용한 뒤 한 번만 실행한다. 활동 로그는
의도적으로 이전하지 않는다. AWS S3 객체는 건드리지 않으며 파일 메타데이터와 글·청원 연결만
PostgreSQL로 이전한다.

## 안전장치

- `npm run db:migrate:data`는 기본적으로 읽기 전용 드라이런이다.
- 실제 쓰기에는 `--execute`가 필요하다.
- 출력된 Supabase project ref를 `--confirm-target`으로 다시 입력해야 한다.
- 대상에 데이터가 있으면 `--reset-target` 없이는 중단한다.
- 실제 이전은 하나의 PostgreSQL 트랜잭션으로 실행된다.
- 참조 누락, 중복 또는 이전 후 행 개수 불일치가 있으면 전체 롤백한다.

## 1. Preview에서 연습

`.env`에 다음 연결을 설정한다.

```dotenv
MONGO_URI=<preview MongoDB connection string>
DATABASE_URL=<preview Supabase transaction pooler, port 6543>
DIRECT_DATABASE_URL=<preview Supabase session pooler, port 5432>
```

로컬 네트워크가 Supabase direct connection의 IPv6 주소를 지원하지 않으면
`DIRECT_DATABASE_URL`에는 Dashboard의 **Connect → Session pooler** 주소를 사용한다.

스키마와 연결을 확인한다.

```bash
npm run db:migrate
npm run db:health
npm run db:smoke
```

읽기 전용 드라이런을 실행한다.

```bash
npm run db:migrate:data
```

출력에서 다음 항목을 확인한다.

- Source MongoDB database가 preview DB인지
- Target PostgreSQL project reference가 preview Supabase project ref인지
- 각 MongoDB 컬렉션의 문서 개수가 예상과 맞는지
- 마지막 줄이 `Validation passed. No PostgreSQL data was changed.`인지

드라이런 마지막에 표시되는 명령을 그대로 복사해 실행한다. Preview DB의 테스트 데이터를
삭제해도 되는 경우에만 `--reset-target`이 포함된 명령을 사용한다.

```bash
npm run db:migrate:data -- --execute --reset-target --confirm-target=<preview-project-ref>
```

완료 후 Supabase SQL Editor에서 주요 개수와 관계를 확인하고 사이트에서 기존 사용자 로그인,
글·댓글·좋아요·첨부파일 조회를 시험한다.

## 2. Production 이전

1. MongoDB Atlas에서 최신 백업 또는 snapshot을 만든다.
2. Production Supabase에 `npm run db:migrate`로 스키마를 먼저 적용한다.
3. 로컬 `.env`의 `MONGO_URI`를 production MongoDB로 바꾼다.
4. `DATABASE_URL`과 `DIRECT_DATABASE_URL`을 production Supabase로 바꾼다.
5. `npm run db:migrate:data`를 실행하고 source DB 이름, target project ref, 개수를 확인한다.
6. 드라이런이 출력한 실행 명령을 복사해 실행한다.

새 Production Supabase가 비어 있다면 실행 명령에 `--reset-target`이 없어야 한다.
Production에서 `--reset-target`은 대상 데이터를 전부 삭제해도 된다고 직접 확인한 경우에만
사용한다.

```bash
npm run db:migrate:data -- --execute --confirm-target=<production-project-ref>
```

`Migration committed successfully. All row-count checks passed.`가 출력되어야 성공이다.

## 3. 배포 전환과 확인

Vercel의 Production 환경변수 `DATABASE_URL`을 production Supabase transaction pooler 주소로
설정하고 배포한다. `DIRECT_DATABASE_URL`과 `MONGO_URI`는 런타임에 필요하지 않으므로 Vercel에
둘 필요가 없다.

배포 후 다음을 확인한다.

- 이전 사용자가 Google로 로그인했을 때 기존 닉네임·권한·포인트가 표시되는지
- 게시글, 댓글, 좋아요, 청원 서명, 강의평 관계가 유지되는지
- 기존 AWS S3 첨부파일이 열리는지
- 새 글과 댓글 작성이 정상인지

문제가 있으면 Vercel의 `DATABASE_URL`을 기존 배포 설정으로 되돌리고 원인을 수정한다.
MongoDB 데이터는 확인이 끝날 때까지 삭제하지 않는다.

## 4. 완료 후 정리

검증 기간이 끝나면 legacy 호환 코드를 남기지 않기 위해 다음을 제거한다.

- `.env`와 로컬 비밀 저장소의 `MONGO_URI`
- `scripts/database/migrate-mongodb.ts`
- `package.json`의 `db:migrate:data`
- `mongodb` 패키지

MongoDB 자체는 백업 보존 기간을 정한 뒤 별도로 폐기한다. 그 다음 단계에서 AWS S3 객체를
Cloudflare R2로 이전한다.
