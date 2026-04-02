<div class="module">
	<div class="module_head">
		<h1>&lt;개인정보처리방침&gt;</h1>
	</div>

	<div class="content">
		<p class="intro">
			KENTECH 학생회(이하 "학생회")는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 관련
			고충을 신속하게 처리하기 위해 아래와 같이 개인정보처리방침을 수립·공개합니다.
		</p>

		<section>
			<h3>1. 수집하는 개인정보 항목</h3>
			<p>본 서비스는 Google OAuth 인증을 통해 회원가입 시 아래 항목을 수집합니다.</p>
			<table>
				<thead>
					<tr>
						<th>항목</th>
						<th>수집 방식</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>구글 계정 고유 식별번호(sub)</td>
						<td>Google 로그인 시 자동 수집</td>
					</tr>
					<tr>
						<td>이메일 주소</td>
						<td>Google 로그인 시 자동 수집</td>
					</tr>
					<tr>
						<td>이름(프로필 성명)</td>
						<td>Google 로그인 시 자동 수집</td>
					</tr>
					<tr>
						<td>닉네임</td>
						<td>이용자 직접 입력</td>
					</tr>
				</tbody>
			</table>
			<p>서비스 이용 과정에서 아래 정보가 추가로 생성·저장될 수 있습니다.</p>
			<ul>
				<li>작성한 게시글, 댓글, 청원, 강의평</li>
				<li>업로드한 파일 (이미지 등)</li>
				<li>계정 생성일, 최종 수정일</li>
			</ul>
			<p class="note">
				※ 본 서비스는 비밀번호, 결제정보, 주민등록번호 등 민감한 개인정보를 수집하지 않습니다.
			</p>
		</section>

		<section>
			<h3>2. 개인정보 수집 및 이용 목적</h3>
			<ul>
				<li>회원 식별 및 로그인 인증</li>
				<li>게시글·댓글·청원·강의평 작성 기능 제공</li>
				<li>서비스 운영 및 부정 이용 방지 (이용 제한 처리 등)</li>
			</ul>
		</section>

		<section>
			<h3>3. 개인정보 보관 기간 및 파기</h3>
			<p>원칙적으로 이용자의 회원 탈퇴 시 수집한 개인정보를 지체 없이 파기합니다.</p>
			<p>
				단, 커뮤니티 내 부정 이용 방지 및 관계 법령에 따른 수사 협조를 위해 아래와 같이 특정 정보를
				일정 기간 보관 후 파기합니다.
			</p>

			<table>
				<thead>
					<tr>
						<th>보유 항목</th>
						<th>보관 기간 및 파기 시점</th>
						<th>보관 사유</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>회원 식별 정보 (sub, 이메일, 이름)</td>
						<td>탈퇴 후 6개월 보관 후 즉시 파기</td>
						<td>부정 이용 방지 및 수사 협조</td>
					</tr>
					<tr>
						<td>작성 콘텐츠 (게시글, 댓글 등)</td>
						<td>탈퇴 시 익명화 처리 후 서비스 종료 시까지 유지</td>
						<td>콘텐츠 서비스 제공 (단, 작성자 연결 정보는 6개월 후 영구 파기)</td>
					</tr>
					<tr>
						<td>업로드 파일 (이미지, 문서 등)</td>
						<td>모든 연결된 게시물 삭제 시 1일 이내 파기</td>
						<td>콘텐츠 서비스 제공</td>
					</tr>
				</tbody>
			</table>

			<p class="note">
				※ 이용자는 본인이 작성한 게시물을 직접 삭제함으로써 해당 정보의 파기를 요청할 수 있습니다.
				단, 회원 탈퇴 후 익명화 처리된 게시물은 작성자 본인 확인이 불가능하여 삭제 요청이 제한될 수
				있으므로 중요한 정보는 탈퇴 전 직접 삭제하시기 바랍니다.
			</p>
		</section>
		<section>
			<h3>4. 개인정보의 제3자 제공</h3>
			<p>
				학생회는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 이용자의 사전
				동의가 있거나 법령에 의한 경우는 예외로 합니다.
			</p>
		</section>

		<section>
			<h3>5. 개인정보 처리 위탁</h3>
			<p>원활한 서비스 제공을 위해 아래 업체에 일부 업무를 위탁합니다.</p>
			<table>
				<thead>
					<tr>
						<th>수탁 업체</th>
						<th>위탁 업무</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Google LLC</td>
						<td>OAuth 인증</td>
					</tr>
					<tr>
						<td>MongoDB Atlas</td>
						<td>회원 및 콘텐츠 데이터 저장</td>
					</tr>
					<tr>
						<td>Amazon Web Services (AWS S3)</td>
						<td>파일 저장</td>
					</tr>
					<tr>
						<td>Vercel Inc.</td>
						<td>서비스 호스팅</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section>
			<h3>6. 보안 조치</h3>
			<ul>
				<li>Google OAuth 2.0 인증을 통한 안전한 로그인 처리</li>
				<li>SSL/TLS 암호화 통신 적용</li>
				<li>접근 권한을 통한 데이터 접근 제한</li>
			</ul>
		</section>

		<section>
			<h3>7. 이용자의 권리</h3>
			<p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
			<ul>
				<li>개인정보 열람 요청</li>
				<li>개인정보 정정·삭제 요청</li>
				<li>개인정보 처리정지 요청</li>
				<li>Google 계정 설정에서 앱 연결 해제</li>
			</ul>
			<p>
				요청은 아래 문의처(<a href="mailto:studentcouncil@kentech.ac.kr"
					>studentcouncil@kentech.ac.kr</a
				>)로 연락해 주시면 처리해 드립니다.
			</p>
		</section>

		<section>
			<h3>8. 개인정보 보호책임자</h3>
			<table>
				<thead>
					<tr>
						<th>항목</th>
						<th>내용</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>성명</td>
						<td>권우성</td>
					</tr>
					<tr>
						<td>이메일</td>
						<td>
							<a href="mailto:miniipad03@kentech.ac.kr">miiniipad03@kentech.ac.kr</a>
						</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section>
			<h3>9. 개인정보처리방침 변경 안내</h3>
			<p>본 방침이 변경될 경우 변경 사항을 시행 7일 전 사이트 공지를 통해 안내합니다.</p>
		</section>

		<p class="effective-date">시행일: 2026년 4월 2일</p>
	</div>
</div>

<style lang="scss">
	.module_head {
		text-align: center;
	}

	.content {
		padding: 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;

		.intro {
			line-height: 1.7;
		}

		section {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			h3 {
				font-size: 1rem;
				font-weight: bold;
				border-left: 3px solid var(--primary);
				padding-left: 0.6rem;
			}

			p,
			li {
				font-size: 0.9rem;
				line-height: 1.7;
				color: var(--gray-text);
			}

			ul {
				padding-left: 1.2rem;
				display: flex;
				flex-direction: column;
				gap: 0.3rem;
			}

			.note {
				font-size: 0.85rem;
				color: var(--info-text);
			}
		}

		table {
			width: 100%;
			border-collapse: collapse;
			font-size: 0.9rem;

			th,
			td {
				border: 1px solid var(--gray-border);
				padding: 0.5rem 0.75rem;
				text-align: left;
			}

			th {
				background-color: var(--gray-bg);
				font-weight: bold;
			}
		}

		a {
			color: var(--primary-text);
		}

		.effective-date {
			font-size: 0.85rem;
			color: var(--gray-text);
			text-align: right;
		}
	}
</style>
