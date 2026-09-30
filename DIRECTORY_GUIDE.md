
Frontend/
├─ public/                              # URL로 직접 참조하는 정적 파일
│  ├─ favicon.svg
│  └─ icons.svg
├─ src
│  ├─ api/                              # Axios 설정과 서버 요청 함수
│  ├─ assets/                           # 앱에서 import하는 이미지·아이콘
│  │  ├─ images/
│  │  └─icons/
│  │
│  ├─ components/                       # 여러 페이지에서 재사용하는 UI
│  ├─ pages/
│  │  ├─ onboarding/                    # 로그인 및 최초 설정 화면
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ NicknamePage.jsx
│  │  │  └─ LocationSetupPage.jsx
│  │  ├─ home/
│  │  │  └─ HomePage.jsx
│  │  ├─ community/                     # 커뮤니티 화면
│  │  │  ├─ CommunityPage.jsx
│  │  │  └─ PostCreatePage.jsx
│  │  ├─ situation/                     # 상황별 콘텐츠 화면
│  │  │  ├─ SituationPage.jsx
│  │  │  └─ SituationDetailPage.jsx
│  │  ├─ mypage/                        # 내 정보 및 설정 화면
│  │  │  ├─ MyPage.jsx
│  │  │  ├─ ProfileEditPage.jsx
│  │  │  ├─ NotificationSettingsPage.jsx
│  │  │  ├─ PaymentManagementPage.jsx
│  │  │  └─ MyActivityPage.jsx
│  │  └─ premium/                       # 프리미엄 화면
│  │     ├─ PremiumPage.jsx
│  │     └─ PremiumSurveyPage.jsx
│  ├─ store/                            # Zustand 전역 상태
│  ├─ App.css                           # 현재 Vite 기본 화면 스타일
│  ├─ App.jsx                           # 최상위 화면 및 라우팅 연결 위치
│  ├─ index.css                         # 전역 스타일과 Tailwind CSS
│  └─ main.jsx                          # React 앱 진입점
├─ .gitignore                           # Git에서 제외할 파일·폴더
├─ eslint.config.js                     # ESLint 설정
├─ index.html                           # HTML 진입 파일
├─ package.json                         # 프로젝트와 패키지 설정
├─ package-lock.json                    # 설치된 패키지 버전 잠금
├─ vite.config.js                       # Vite 및 플러그인 설정
└─ DIRECTORY_GUIDE.md                   # 이 구조 안내 문서
```

## 폴더와 파일의 역할

- `public/`: 빌드 과정에서 변환하지 않고 그대로 제공할 파일을 둡니다.
- `src/assets/`: 컴포넌트나 페이지에서 import해서 쓸 이미지·아이콘을 둡니다.
- `src/pages/`: URL로 이동하는 페이지를 화면 영역별로 모읍니다. 현재 페이지 파일은 화면 구현을 시작하기 위한 최소 뼈대입니다.
- `src/components/`: 여러 페이지에서 함께 쓰는 버튼, 헤더, 모달 등을 둡니다.
- `src/api/`: Axios 공통 설정과 서버 요청 함수를 둡니다. 서버 API 명세가 정해지면 아래 파일들을 필요한 만큼 추가합니다.
- `src/store/`: 여러 페이지에서 공유할 Zustand 상태가 생기면 상태 파일을 추가합니다.
- `App.jsx`: React Router 경로와 최상위 화면을 연결할 위치입니다. 현재 새 페이지들은 아직 라우터에 연결되지 않았습니다.
- `main.jsx`: React 앱을 브라우저에 연결합니다. TanStack Query Provider도 이 진입부에서 연결합니다.
- `index.css`: 전역 스타일과 Tailwind CSS를 불러옵니다.

## API 연동 시 추가할 파일 예시

```text
src/api/
├─ axios.js       # Axios 공통 baseURL, 헤더 설정
├─ auth.js        # 로그인·인증 API
├─ location.js    # 위치 API
├─ community.js   # 커뮤니티 API
├─ situation.js   # 상황별 콘텐츠 API
├─ user.js        # 사용자·마이페이지 API
└─ premium.js     # 프리미엄·결제 API
```
