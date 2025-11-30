// src/store.ts
// 공유할 XR 스토어 (컨트롤러, 손 모델)

import { createXRStore } from '@react-three/xr';

export const store = createXRStore({
    controller: { model: true, },
    hand: { model: true },
});