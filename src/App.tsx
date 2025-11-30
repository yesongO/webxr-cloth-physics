// src/App.tsx
// 메인 앱 컴포넌트 

// 📢 설치 명령어 (npm 사용 시)
// : R3F(react three fiber) 및 WebXR v6 스토어 기능을 사용합니다.
// : WebXR 에뮬레이터에서의 충돌 방지를 위해 Three.js 버전 0.160.0 사용합니다.
/*
npm install @react-three/fiber @react-three/xr @react-three/drei
npm install three@0.160.0
npm install --save-dev @types/three@0.160.0
*/

import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { useState } from 'react';
import { store } from './store';

import { EnterVRButton } from './components/ui/EnterVRButton.tsx';
import { BackgroundParticles } from './components/effects/BackgroundParticles.tsx';

import { ClothSimulation } from './components/ClothSimulation.tsx';
import { Environment } from '@react-three/drei';


function Scene({ VRButtonHovered }: { VRButtonHovered: boolean }) {
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <BackgroundParticles VRButtonHovered={VRButtonHovered} count={100}/>
      <Environment preset="forest" />
      <group position={[0, -1.5, 3]} scale={2.5}>
        <ClothSimulation />
      </group>
    </>
  );
}

export default function App() {
  const [isVRButtonHovered, setIsVRButtonHovered] = useState(false);
  return (
    <>
      <EnterVRButton 
        onEnter={() => store.enterVR()} 
        label="Enter WebXR Experience"
        className="vr-button"
        onHoverStart={() => setIsVRButtonHovered(true)}
        onHoverEnd={() => setIsVRButtonHovered(false)}
      />

      <Canvas>
        <XR store={store}>
          <color attach="background" args={['#1a1a1a']} />
          <Scene VRButtonHovered={isVRButtonHovered} />
        </XR>
      </Canvas>
    </>
  );
}