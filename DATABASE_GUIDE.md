# 데이터베이스 가이드

## 연결

- `DATABASE_URL`: 애플리케이션 런타임 전용이다. Vercel에서는 Supabase transaction
  pooler의 6543 포트 연결 문자열을 사용한다.
- `DIRECT_DATABASE_URL`: 스키마 마이그레이션 전용이다. direct connection 또는 session
  pooler의 5432 포트 연결 문자열을 사용한다.
- 비밀값은 `.env` 계열 파일과 Vercel 환경 변수에만 저장하고 저장소에 커밋하지 않는다.

런타임은 `pg.Pool`과 Drizzle ORM을 사용한다. Supabase SDK나 Data API를 거치지 않으므로
일반 PostgreSQL로 이전해도 repository 코드는 그대로 유지할 수 있다.

## 스키마

- `app`: 사용자, 파일, 운영 데이터
- `private`: 외부 인증 식별자처럼 브라우저에 노출하면 안 되는 데이터
- `community`: 게시판, 공개 소통 글, 과거 감사원 제보 보존 테이블
- `academic`: 강의, 시간표, 졸업 데이터
- `points`: 포인트 원장과 집계 데이터

`app.users.id`는 모든 도메인 관계의 기준인 내부 UUID다.
`private.user_identities`는 `(issuer, subject)`를 내부 사용자 UUID에 연결한다. 이메일은
학교에서 재사용될 수 있으므로 unique identity나 관계 키로 사용하지 않는다.

좋아요, 청원 서명, 파일 연결 같은 다대다 관계는 다음 연결 테이블로 정규화한다.

- `community.post_likes`
- `community.submission_supports`
- `community.post_files`
- `community.submission_files`

청원·문의·건의는 `community.submissions`를 함께 사용하고 `kind`로 구분한다.
현재 감사원 익명 제보는 외부 Google Form으로 연결하며 사이트 DB에 새 제보를 저장하지 않는다.
기존 `community.audit_reports`와 Drizzle의 `anonymousReports` 정의는 과거 데이터 보존을 위해
유지한다. 이 테이블에는 제목·내용·처리 상태가 있으며 작성자 식별자는 없다. 내부 기능 제거는
테이블 삭제를 의미하지 않으며, 데이터 정리는 별도 검토 없이 수행하지 않는다.

모든 테이블에는 RLS가 켜져 있지만 현재 정책은 의도적으로 없다. 애플리케이션은
브라우저에서 Data API에 직접 접근하지 않고 SvelteKit 서버에서 권한을 검사한다. 런타임
연결에는 RLS를 우회할 수 있는 서버 전용 DB 역할을 사용해야 한다.

## 스키마 변경 절차

1. `src/lib/server/database/`의 해당 도메인 스키마 파일을 수정한다.
   - `user.schema.ts`: 사용자·인증 연결
   - `community.schema.ts`: 게시판·소통
   - `academic.schema.ts`: 강의·성적·시간표
   - `app.schema.ts`: 파일·배너·푸시 등 운영 데이터
   - `points.schema.ts`: 포인트 데이터
   - `schema-core.ts`: 공통 PostgreSQL schema 정의
   - `schema.ts`: 재수출과 RLS 활성화 진입점. 새 테이블은 여기에도 반영한다.
2. `npm run db:generate -- --name=<변경_이름>`으로 SQL을 생성한다.
3. 생성된 SQL과 `drizzle/meta` 변경을 함께 검토한다.
4. preview DB의 `DIRECT_DATABASE_URL`을 설정하고 `npm run db:migrate`를 실행한다.
5. preview 환경에서 관련 기능과 트랜잭션을 확인한 뒤 production에 같은 마이그레이션을
   적용한다.

운영 DB에 `drizzle-kit push`를 직접 사용하지 않는다. 저장소에 포함된 SQL
마이그레이션만 순서대로 적용한다.

## 트랜잭션

트랜잭션 경계는 `usecase` 계층이 소유한다.
`src/lib/server/db.ts`의 `transaction()` 안에서 호출되는 repository는
`AsyncLocalStorage`를 통해 같은 PostgreSQL transaction client를 사용한다. service나
repository에서 독립적으로 트랜잭션을 열지 않는다.

좋아요, 서명, 포인트 한도, 도배 방지는 unique constraint와 조건부
`INSERT`/`UPDATE ... RETURNING`으로 동시 요청을 방어한다.
