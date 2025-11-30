// src/math/vector.ts
// 벡터 연산 함수

export type VectorArray = Float32Array | number[];

// 벡터 초기화
export function vecSetZero(a: VectorArray, anr: number) {
    anr *= 3;
    a[anr++] = 0.0;
    a[anr++] = 0.0;
    a[anr] = 0.0;
}

// 벡터 스케일링
export function vecScale(a: VectorArray, anr: number, scale: number) {
    anr *= 3;
    a[anr++] *= scale;
    a[anr++] *= scale;
    a[anr] *= scale;
}

// 벡터 복사
export function vecCopy(a: VectorArray, anr: number, b: VectorArray, bnr: number) {
    anr *= 3;
    bnr *= 3;
    a[anr++] = b[bnr++];
    a[anr++] = b[bnr++];
    a[anr] = b[bnr];
}

// 벡터 더하기
export function vecAdd(a: VectorArray, anr: number, b: VectorArray, bnr: number, scale = 1.0) {
    anr *= 3;
    bnr *= 3;
    a[anr++] += b[bnr++] * scale;
    a[anr++] += b[bnr++] * scale;
    a[anr] += b[bnr] * scale;
}

// 벡터 차이
export function vecSetDiff(dst: VectorArray, dnr: number, a: VectorArray, anr: number, b: VectorArray, bnr: number, scale = 1.0) {
    dnr *= 3;
    anr *= 3;
    bnr *= 3;
    dst[dnr++] = (a[anr++] - b[bnr++]) * scale;
    dst[dnr++] = (a[anr++] - b[bnr++]) * scale;
    dst[dnr] = (a[anr] - b[bnr]) * scale;
}

// 벡터 길이 제곱
export function vecLengthSquared(a: VectorArray, anr: number) {
    anr *= 3;
    let a0 = a[anr], a1 = a[anr + 1], a2 = a[anr + 2];
    return a0 * a0 + a1 * a1 + a2 * a2;
}

// 벡터 거리 제곱
export function vecDistSquared(a: VectorArray, anr: number, b: VectorArray, bnr: number) {
    anr *= 3;
    bnr *= 3;
    let a0 = a[anr] - b[bnr], a1 = a[anr + 1] - b[bnr + 1], a2 = a[anr + 2] - b[bnr + 2];
    return a0 * a0 + a1 * a1 + a2 * a2;
}

// 벡터 내적
export function vecDot(a: VectorArray, anr: number, b: VectorArray, bnr: number) {
    anr *= 3;
    bnr *= 3;
    return a[anr] * b[bnr] + a[anr + 1] * b[bnr + 1] + a[anr + 2] * b[bnr + 2];
}

// 벡터 외적
export function vecSetCross(a: VectorArray, anr: number, b: VectorArray, bnr: number, c: VectorArray, cnr: number) {
    anr *= 3;
    bnr *= 3;
    cnr *= 3;
    a[anr++] = b[bnr + 1] * c[cnr + 2] - b[bnr + 2] * c[cnr + 1];
    a[anr++] = b[bnr + 2] * c[cnr + 0] - b[bnr + 0] * c[cnr + 2];
    a[anr] = b[bnr + 0] * c[cnr + 1] - b[bnr + 1] * c[cnr + 0];
}