// src/components/effects/BackgroundParticles.tsx
// 배경 파티클 효과 컴포넌트 구현

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 하나의 파티클(구체)
function Particle({ VRButtonHovered }: { VRButtonHovered: boolean }) {
    const mesh = useRef<THREE.Mesh>(null);

  // 초기 랜덤 위치 및 속도 설정
    const [initialPos, randomSpeed] = useMemo(() => {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 10, // X: -5 ~ 5
            (Math.random() - 0.5) * 5 + 1, // Y: 0 ~ 3.5 (눈높이 주변)
            (Math.random() - 0.5) * 5 - 2 // Z: -4.5 ~ 0.5
        );
        const speed = Math.random() * 0.5 + 0.2;
        return [pos, speed];
    }, []);

  // 매 프레임마다 애니메이션 계산
    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();

        // 목표 위치 계산
        let targetPos = new THREE.Vector3();

        if (VRButtonHovered) {
        // Enter VR Mode 버튼 호버 시: 약간의 랜덤성을 주어 중앙으로 모이게 함
        targetPos.set(
            initialPos.x * 0.1,  // 원래 X 위치의 10%로 축소
            Math.sin(time * randomSpeed) * 0.1, // 높이 방향으로 사인파 운동
            initialPos.z * 0.1   // 원래 Z 위치의 10%로 축소
        );
        } else {
        // 평소: 자유롭게 떠다님 (초기 위치 기준에서 사인파 운동)
        targetPos.set(
            initialPos.x + Math.sin(time * randomSpeed) * 0.5,
            initialPos.y + Math.cos(time * randomSpeed * 0.8) * 0.5,
            initialPos.z + Math.sin(time * randomSpeed * 0.5) * 0.5
            );
        }

        // 현재 위치에서 목표 위치로 부드럽게 이동 (Lerp)
        // Enter VR Mode 버튼 호버 시: 빠르게(0.1), 아닐 때는 천천히(0.02)
        const lerpFactor = VRButtonHovered ? 0.1 : 0.02;
        mesh.current.position.lerp(targetPos, lerpFactor);
        
        // 살짝의 회전값
        mesh.current.rotation.x += 0.01;
        mesh.current.rotation.y += 0.01;
    });

    return (
        <mesh ref={mesh}>
        {/* 작은 구체 */}
        <sphereGeometry args={[0.08, 10, 10]} /> 
        <meshStandardMaterial 
            color="#F0FFFF" // 기본컬러: 애쥬어
            emissive="#0000FF" // 자기발광: 파란색
            emissiveIntensity={VRButtonHovered ? 2 : 0.5} // 호버 시 더 밝게 빛나게
            roughness={0.1}
            metalness={0.8}
        />
        </mesh>
    );
}

// 여러 개의 파티클을 렌더링하는 컨테이너
export function BackgroundParticles({ VRButtonHovered, count = 30 }: { VRButtonHovered: boolean, count?: number }) {
  // count 개수만큼 배열 생성
    const particles = useMemo(() => new Array(count).fill(0), [count]);

    return (
        <>
        {particles.map((_, i) => (
            <Particle key={i} VRButtonHovered={VRButtonHovered} />
        ))}
        </>
    );
}