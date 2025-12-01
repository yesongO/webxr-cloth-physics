// src/components/ClothSimulation.tsx
// 옷감 물리 시뮬레이션 컴포넌트 구현

import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { ClothPhysics } from '../physics/ClothPhysics';
import { CLOTH_MESH_DATA } from '../data/meshData';

export function ClothSimulation() {
    const meshRef = useRef<THREE.Mesh>(null);

  // 물리 엔진 생성
    const physics = useMemo(() => new ClothPhysics(CLOTH_MESH_DATA, 1.0), []);

  // 초기 Geometry 설정
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(physics.pos, 3));
        geo.setIndex(new THREE.BufferAttribute(physics.triIds, 1));
        geo.computeVertexNormals();
        return geo;
    }, [physics]);

    // --------------------------------------------------------------
    // 이벤트 핸들러: 클릭 시 옷감 시뮬레이션에 힘을 가함, applyImpulse() 함수 사용
    // --------------------------------------------------------------
    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        // 닿은 지점 좌표
        const { x, y, z } = e.point;

        // 힘의 방향 계산
        // 법선(Normal) 방향으로 힘을 줘서 바람처럼 밀어냄
        let forceX = 0, forceY = 0, forceZ = 0;

        if (e.face && e.face.normal) {
            const strength = 10.0; // 💡 힘의 세기
            forceX = -e.face.normal.x * strength; // 반대 방향으로 밀기
            forceY = -e.face.normal.y * strength;
            forceZ = -e.face.normal.z * strength;
        } else {
            // 법선 없으면 그냥 뒤로 밀기
            forceZ = -2.0; 
        }

        // 반경(radius) 5 범위에 힘을 가하기
        physics.applyImpulse([x, y, z], [forceX, forceY, forceZ], 5);
    };

    // 애니메이션 루프
    useFrame(() => {
        if (!meshRef.current) return;

        // 물리 업데이트
        const dt = 1 / 60;
        const numSubsteps = 15;
        const sdt = dt / numSubsteps;
        const gravity = [0, -9.8, 0];

        for (let i = 0; i < numSubsteps; i++) {
            physics.preSolve(sdt, gravity);
            physics.solve(sdt);
            physics.postSolve(sdt);
        }

        // 화면 갱신
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.geometry.computeVertexNormals();
    });

    return (
        <mesh 
        ref={meshRef} 
        geometry={geometry} 
        frustumCulled={false} // 항상 렌더링 (깜빡임 방지)
        // 💡 웹상: 마우스 클릭 시 & VR상: 컨트롤러 버튼 누를 시 이벤트 처리
        onPointerDown={handlePointerMove}
        >
        <meshPhongMaterial 
            color={0x0064FF} // 파란색
            side={THREE.DoubleSide} 
            flatShading={false} 
            specular={0x111111}
            shininess={0.0}
        />
        </mesh>
    );
}