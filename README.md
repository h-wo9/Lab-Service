# 🔬 랩실 관리 시스템 (Lab Management System)

> 학과 스터디 및 프로젝트 랩실의 효율적인 운영을 위한 풀스택 통합 관리 웹 애플리케이션

---

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| **Frontend** | React (Vite), Material-UI (MUI), Axios, React Router DOM |
| **Backend** | Python, FastAPI, SQLAlchemy (ORM), Pydantic, Uvicorn |
| **인증** | JWT (python-jose), bcrypt (passlib) |
| **Database** | MySQL 8.0 |

---

## 🚀 실행 방법

### 백엔드
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000 에서 실행
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 에서 실행
```

### 환경 변수 (`backend/.env`)
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/lab_system
```

---

## 📌 주요 기능

### 1. 로그인 / 회원가입

> ![alt text](assets/image.png)

- 좌우 분할 스크린 디자인 (좌: 브랜딩 패널, 우: 폼)
- 학번(student_id) + 비밀번호로 로그인
- JWT 토큰 발급 및 `localStorage` 저장
- 로그인 성공 시 사용자 정보(이름, 소속 랩실, 권한) 자동 저장
- 회원가입 시 이름, 학번, 비밀번호 입력 (bcrypt 암호화 저장)
- 토큰 만료 시 자동 로그아웃 (401 인터셉터)

---

### 2. 대시보드

> ![alt text](assets/image-1.png)

- 로그인한 사용자 이름과 인사말 표시
- **요약 위젯 3개**: 랩실 공금 잔액 / 랩실 인원 수 / 오늘 예정 일정 수 (카운트업 애니메이션)
- **다가오는 일정** 리스트 (오늘 일정은 별도 강조)
- **최근 입출금 내역** 리스트 (수입/지출 색상 구분)
- 소속 랩실이 없을 경우 → 랩실 개설/가입 안내 화면 표시

---

### 3. 일정 관리

> ![alt text](assets/image-2.png)

- **타임라인** 형태로 일정 시각화 (날짜 기준 정렬)
- 오늘 / 미래 / 지난 일정 색상 구분 (보라 / 회색)
- **일정 추가**: 제목 + 날짜 입력 → `POST /labs/{lab_id}/schedules`
- **일정 수정**: 연필 아이콘 클릭 → 기존 내용 미리 채워진 모달 → `PUT /schedules/{id}`
- **일정 삭제**: 삭제 아이콘 클릭 → 확인 후 즉시 반영 → `DELETE /schedules/{id}`

---

### 4. 랩실 관리

#### 멤버 목록 (전체 공개)
- 랩장 카드 (별도 강조) + 랩원 그리드 표시
- 이름 첫 글자 기반 컬러 아바타 자동 적용

#### 가입 신청 관리 (랩장 전용 탭)
- 접수된 가입 신청서 목록 조회 → `GET /labs/{lab_id}/applications`
- 대기 중 / 처리 완료 건 구분 표시
- **승인** 처리 → `PUT /applications/{id}/status` (status: `approved`) → 해당 학생 랩실 자동 합류
- **반려** 처리 → `PUT /applications/{id}/status` (status: `rejected`)
- 대기 중인 신청이 있으면 탭에 뱃지 숫자 표시

---

### 5. 랩실 개설 / 가입 신청

> ![alt text](assets/image-3.png)

- 소속 랩실이 없는 사용자에게 진입 경로 제공

#### 랩실 개설
- 이름, 연구 분야, 소개 입력 → `POST /labs`
- 개설 즉시 신청자에게 랩장 권한 자동 부여

#### 기존 랩실 가입 신청
- 전체 랩실 목록 조회 → `GET /labs`
- 원하는 랩실 선택 후 지원 동기 작성 → `POST /labs/{lab_id}/applications`
- 신청 완료 후 랩장 승인 대기

---

### 6. 장부 관리

![alt text](assets/image-4.png)

- 현재 랩실 잔액 / 총 수입 / 총 지출 요약 카드 3개
- 전체 수입·지출 내역 테이블 (행 좌측 색상 바로 수입/지출 구분)
- **내역 추가**: 분류(수입/지출), 날짜, 내역, 금액 입력 → `POST /labs/{lab_id}/finances`

---

### 7. 회비 관리

![alt text](assets/image-6.png)


- 회비 청구 목록 조회 → `GET /labs/{lab_id}/fees`
- 납부 진행도 프로그레스 바 (납부 완료 수 / 전체 랩원 수)
- **납부하기**: 본인의 미납 항목에만 버튼 표시 → `PUT /fees/{fee_id}/pay`
- **납부 현황 보기**: 펼치면 전체 랩원 납부 상태 그리드 (✅ 완료 / ❌ 미납)
- **회비 청구** (랩장 전용): 제목 + 금액 입력 → `POST /labs/{lab_id}/fees` → 소속 전 랩원에게 납부 내역 자동 생성

---

### 8. 통계 분석

![alt text](assets/image-5.png)

DB 핵심 개념(`GROUP BY`, `SUM`, `COUNT`, `JOIN`)을 활용한 통계 집계 API 기반 시각화.

| 통계 항목 | 사용 SQL 개념 |
|---|---|
| 수입/지출 타입별 합계 및 건수 | `GROUP BY type` + `SUM` + `COUNT` |
| 월별 수입/지출 추이 | `GROUP BY DATE_FORMAT(record_date, '%Y-%m')` + `SUM` |
| 회비 납부 완료/미납 현황 | `JOIN` + `GROUP BY is_paid` + `COUNT` |
| 랩원 수, 일정 수 | `COUNT` |

#### 시각화 구성
- **수입/지출 비율**: `conic-gradient` 도넛 차트 (외부 라이브러리 미사용)
- **월별 추이**: 커스텀 바 차트
- **회비 납부율**: MUI LinearProgress

---

## 🗄 데이터베이스 ERD

```
users ──────────────────────────────────────────────────────┐
 student_id (PK)                                            │
 name, password, role, lab_id (FK → labs)                  │
                                                            │
labs ─────────────────────────────────────────────────────┐ │
 lab_id (PK)                                              │ │
 name, field, description, leader_id (FK → users)         │ │
                                                          │ │
applications ─────────────────────────────────────────────┘ │
 app_id (PK)                                                │
 student_id (FK → users), lab_id (FK → labs)               │
 content, status (pending/approved/rejected), applied_at    │
                                                            │
schedules                      finances                     │
 schedule_id (PK)               finance_id (PK)             │
 lab_id (FK → labs)             lab_id (FK → labs)          │
 title, date                    type, amount, description   │
                                record_date                 │
fees                           fee_payments                  │
 fee_id (PK)                    payment_id (PK)             │
 lab_id, title, amount          fee_id (FK → fees)          │
                                student_id (FK → users)    ─┘
                                is_paid
```

---

## 🔐 API 엔드포인트 요약

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/users/signup` | 회원가입 | ❌ |
| POST | `/users/login` | 로그인 (JWT 발급) | ❌ |
| GET | `/users/me` | 내 정보 조회 | ✅ |
| POST | `/labs` | 랩실 개설 | ✅ |
| GET | `/labs` | 전체 랩실 목록 | ✅ |
| GET | `/labs/my-lab` | 내 랩실 정보 (멤버 포함) | ✅ |
| GET | `/labs/{id}/stats` | 랩실 통계 분석 | ✅ |
| POST | `/labs/{id}/applications` | 가입 신청 | ✅ |
| GET | `/labs/{id}/applications` | 신청 목록 조회 | ✅ |
| PUT | `/applications/{id}/status` | 신청 승인/반려 | ✅ |
| POST | `/labs/{id}/schedules` | 일정 추가 | ✅ |
| GET | `/labs/{id}/schedules` | 일정 목록 조회 | ✅ |
| PUT | `/schedules/{id}` | 일정 수정 | ✅ |
| DELETE | `/schedules/{id}` | 일정 삭제 | ✅ |
| POST | `/labs/{id}/finances` | 장부 내역 추가 | ✅ |
| GET | `/labs/{id}/finances` | 장부 내역 조회 | ✅ |
| POST | `/labs/{id}/fees` | 회비 청구 | ✅ |
| GET | `/labs/{id}/fees` | 회비 목록 조회 | ✅ |
| PUT | `/fees/{id}/pay` | 회비 납부 처리 | ✅ |
| GET | `/fees/{id}/payments` | 납부 현황 조회 | ✅ |
