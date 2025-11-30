// src/components/ui/EnterVRButton.tsx
// 초기 VR 진입버튼 컴포넌트 구현

import './EnterVRButton.css'

interface EnterVRButtonProps {
    onEnter: () => void; // 클릭했을 때 실행할 함수
    label?: string;      // 버튼 텍스트
    className?: string;  // 스타일 클래스
    onHoverStart?: () => void; // 호버 시작 시 실행할 함수
    onHoverEnd?: () => void; // 호버 종료 시 실행할 함수
}

export function EnterVRButton({ 
    onEnter, 
    label = "Enter WebXR Experience", // 기본값 설정
    className = "",
    onHoverStart,
    onHoverEnd, 
}: EnterVRButtonProps) {
    return (
    <div className="vr-button-container">
        <button 
            className={`vr-button ${className}`} 
            onClick={onEnter}
            aria-label="Enter VR Mode"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
        >
        {label}
        </button>
        
        {/* 버튼 아래 작은 설명 텍스트 추가 */}
        <span style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '0.75rem', 
            letterSpacing: '0.05em' 
        }}>
            Interactive Cloth Simulation VR Demo
        </span>
    </div>
    );
}