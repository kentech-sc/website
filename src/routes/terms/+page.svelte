<div class="module">
	<div class="module_head">
		<h1>&lt;서비스 이용약관&gt;</h1>
	</div>

	<div class="content">
		<p class="intro">
			본 약관은 KENTECH 총학생회(이하 "총학생회")가 운영하는 총학생회 홈페이지(이하 "서비스")의 이용에
			관한 조건 및 절차를 규정합니다.
		</p>

		<section>
			<h3>1. 서비스 목적</h3>
			<p>
				본 서비스는 KENTECH 구성원 간의 소통과 정보 공유를 위한 총학생회 공식 커뮤니티 플랫폼입니다.
				게시판, 청원, 강의평가 등의 기능을 통해 총학생회 활동 및 학내 정보를 제공합니다.
			</p>
		</section>

		<section>
			<h3>2. 이용 대상</h3>
			<p>
				본 서비스는 <strong>KENTECH 이메일(@kentech.ac.kr) 계정을 보유한 재학생 및 휴학생</strong>을
				대상으로 합니다. KENTECH 이메일로 Google OAuth 인증을 완료한 경우에 한해 서비스를 이용할 수
				있습니다.
			</p>
		</section>

		<section>
			<h3>3. 금지 행위</h3>
			<p>이용자는 서비스 이용 시 아래 행위를 해서는 안 됩니다.</p>
			<ul>
				<li>타인에 대한 욕설, 비방, 혐오 표현</li>
				<li>허위사실 유포 또는 명예훼손</li>
				<li>타인의 개인정보 무단 수집 또는 유포</li>
				<li>도배, 광고, 스팸성 게시물 작성</li>
				<li>저작권 등 타인의 권리를 침해하는 행위</li>
				<li>서비스 운영을 방해하는 행위</li>
				<li>기타 관계 법령에 위반되는 행위</li>
			</ul>
		</section>

		<section>
			<h3>4. 게시물 관리</h3>
			<p>
				이용자가 작성한 게시물의 법적 책임은 작성자 본인에게 있습니다. 총학생회는 아래 경우에 해당하는
				게시물을 사전 통보 없이 삭제하거나 블라인드 처리할 수 있습니다.
			</p>
			<ul>
				<li>본 약관의 금지 행위에 해당하는 게시물</li>
				<li>타인의 신고를 받은 게시물</li>
				<li>운영자가 서비스 운영상 부적절하다고 판단한 게시물</li>
			</ul>
		</section>

		<section>
			<h3>5. 계정 제재</h3>
			<p>
				금지 행위를 반복하거나 서비스 운영에 지장을 주는 이용자는 경고 없이 이용이 제한될 수
				있습니다. 제재에 이의가 있는 경우 아래 문의처로 연락하시기 바랍니다.
			</p>
			<p>
				문의: <a href="mailto:studentcouncil@kentech.ac.kr">studentcouncil@kentech.ac.kr</a>
			</p>
		</section>

		<section>
			<h3>6. 서비스 변경 및 중단</h3>
			<p>
				총학생회는 운영상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다. 총학생회
				임기 종료 등의 사유로 서비스가 종료될 경우 사전에 공지합니다.
			</p>
		</section>

		<section>
			<h3>7. 면책 조항</h3>
			<ul>
				<li>총학생회는 이용자가 작성한 게시물의 내용에 대해 법적 책임을 지지 않습니다.</li>
				<li>천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
				<li>이용자 간 분쟁에 대해 총학생회는 개입 의무를 지지 않습니다.</li>
			</ul>
		</section>

		<section>
			<h3>8. 지적재산권</h3>
			<p>
				서비스 내 총학생회가 제작한 콘텐츠의 저작권은 총학생회에 귀속됩니다. 이용자가 작성한 게시물의
				저작권은 해당 이용자에게 있으나, 총학생회는 서비스 운영 목적 범위 내에서 이를 활용할 수
				있습니다.
			</p>
		</section>

		<section>
			<h3>9. 약관 변경 안내</h3>
			<p>본 약관이 변경될 경우 변경 사항을 시행 7일 전 사이트 공지를 통해 안내합니다.</p>
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
