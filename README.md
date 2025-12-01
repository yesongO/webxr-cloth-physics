# React XR Cloth - Real-time Cloth Physics Toolkit for WebXR

A portable, TypeScript-based PBD cloth engine designed for React-Three-Fiber & WebXR.

## 📢 프로젝트 소개 (Overview)

React XR Cloth는 WebXR 환경에서 재사용 가능한 Cloth Physics 엔진을 목표로 만든 작은 라이브러리 + 데모 프로젝트입니다. 기존의 바닐라 JavaScript로 구현된 PBD 물리 시뮬레이션 로직을 분석하여 모던 프론트엔드 스택(React, TypeScript, React-Three-Fiber)환경에 맞게 재설계 및 현대화한 결과물입니다.  여기서 더 나아가 단순한 시각화를 넘어 WebXR(ex: Meta Quest 3) 환경에서 컨트롤러를 이용해 옷감에 물리적인 바람(Impulse)을 불어넣는 상호작용을 구현했습니다.


## 💡 이 프로젝트가 해결하는 문제들 (Why This Project?)

WebXR 환경에서 독립적으로 재사용 가능한 Cloth Physics 엔진은 거의 존재하지 않습니다. 대부분의 구현은 대부분 렌더링 코드에 강하게 결합되어 있어 React Three Fiber나 XR 컨트롤러 입력과 유연하게 통합하기 어렵습니다. 또한 VR 컨트롤러의 움직임을 Cloth Simulation에 자연스럽게 투영할 수 있는 표준적인 인터랙션 레이어도 부족합니다.

React XR Cloth는 이러한 기술적 공백을 메우고, WebXR 환경에서 쉽게 확장 가능한 Cloth Physics Toolkit을 제공하기 위해 설계되었습니다.


1. 레거시 물리 엔진의 현대화
기존의 바닐라 JavaScript 기반 PBD(Position-Based Dynamics) 코드는
- 유지보수 난이도가 높고
- 타입 안정성이 없으며
- 랜더링 코드와 물리 연산이 섞여 재사용성 측면에서 큰 제약이 있었습니다.

React XR Cloth는 이 구조적 한계를 해결하기 위해 다음 작업을 실행하였습니다.
- TypeScript Class 기반의 모듈 구조로 리팩토링
- 물리 로직(Physics)과 렌더링 로직(View) 완전 분리
- 독립적으로 테스트 가능한 순수 물리 엔진 구현

즉, 라이브러리처럼 가져다 쓸 수 있는 Cloth Engine 형태를 제공합니다.

2. 2D 스크린 기반 인터랙션 한계를 극복
기존 시뮬레이션은 대부분 마우스 드래그 기반 상호작용만 제공하여 실제 물리적 상호작용을 체감하기 어렵다는 근본적 한계가 있었습니다.

이 프로젝트는 상호작용 방식을 VR 공간으로 확장하여 이 문제를 해결합니다.
- WebXR 기반 VR 환경으로 확장
- VR 컨트롤러의 이동,속도,충돌 정보를 실시간으로 물리 엔진에 전달
- 사용자가 직접 옷감에 자극을 줄 수 있는 VR 인터랙션 구현

이를 통해 기존 웹 시뮬레이션을 넘어서는 공간 기반의 체감형 Cloth Experience를 제공합니다.


## 📁 프로젝트 구조 (Project Structure)
물리 엔진(Physics)과 렌더링(View) 레이어를 명확히 분리하고, 컴포넌트를 독립적으로 재사용할 수 있도록 모듈화된 형태로 구성되어 있습니다.

src/
├── 🧠 physics/                 # 렌더러에 독립적인 순수 PBD 물리 엔진
│   └── ClothPhysics.ts         # Position-Based Dynamics & Impulse 계산 코어
│
├── 🎨 components/              # React-Three-Fiber 기반 시각화/인터랙션 컴포넌트
│   ├── effects/                # 3D 비주얼 이펙트
│   │   └── BackgroundParticles.tsx   # 호버·상태 변화에 반응하는 파티클 시스템
│   ├── ui/                     # 2D UI (오버레이)
│   │   ├── EnterVRButton.tsx   # WebXR 진입 버튼
│   │   └── EnterVRButton.css
│   ├── ClothSimulation.tsx     # 물리 엔진과 R3F Mesh를 연결하는 Controller View
│   └── InteractiveCube.tsx     # 테스트용 간단한 큐브 인터랙션 오브젝트
│
├── 🧮 math/                    # TypedArray 기반 벡터·수학 유틸리티
│   └── vector.ts
│
├── 💾 data/                    # 시뮬레이션 초기 지오메트리 데이터
│   └── meshData.ts
│
├── 📦 store.ts                 # WebXR 컨트롤러 전역 상태
└── 🚀 App.tsx                  # 앱 엔트리 + 전체 Scene 구성

