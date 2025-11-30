// src/components/InteractiveCube.tsx
// 기본 인터랙티브 큐브 도형 컴포넌트, 사용 시 App 컴포넌트에서 import 후 호출
// 사용 예시: <InteractiveCube position={[0, 0, 0]} />

import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { RoundedBox } from '@react-three/drei';

export function InteractiveCube(props: any) {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [clicked, setClick] = useState(false);

    return (
    <mesh
        {...props}
        ref={meshRef}
        scale={clicked ? 1.2 : 1} // 클릭하면 살짝 커짐
        onClick={() => setClick(!clicked)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        >

        <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05} smoothness={4}>
            <meshStandardMaterial 
            color={hovered ? '#00BFFF' : '#0000FF'} // 하늘색, 호버 시 파란색
            roughness={0.2} // 매끈한 재질
            metalness={0.1}
            />
        </RoundedBox>
        </mesh>
    );
}