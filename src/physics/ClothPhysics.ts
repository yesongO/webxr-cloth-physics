// src/physics/ClothPhysics.ts
// PBD(Position Based Dynamics) 알고리즘에 기반한 옷감 물리 시뮬레이션 연산 함수 구현

// ☝🏻 PBD 기법이란, 각 정점에 제약 조건 투영 과정을 반복하여 물체의 위치를 업데이트하는 기법입니다.
// ☝🏻 사용하는 제약 조건 함수 : 거리 제약 기반의 스트레칭(Stretching)과 굽힘(Bending)제약 함수


import { vecSetDiff, vecLengthSquared, vecScale, vecAdd, vecCopy, vecDistSquared, vecSetCross } from '../math/vector';

// 이웃한 삼각형 찾기
function findTriNeighbors(triIds: Uint32Array | Uint16Array) {
    const edges = [];
    const numTris = triIds.length / 3;

    for (let i = 0; i < numTris; i++) {
        for (let j = 0; j < 3; j++) {
            const id0 = triIds[3 * i + j];
            const id1 = triIds[3 * i + (j + 1) % 3];
            edges.push({ id0: Math.min(id0, id1), id1: Math.max(id0, id1), edgeNr: 3 * i + j });
        }
    }
    edges.sort((a, b) => ((a.id0 < b.id0) || (a.id0 == b.id0 && a.id1 < b.id1)) ? -1 : 1);

    const neighbors = new Int32Array(3 * numTris);
    neighbors.fill(-1);

    let nr = 0;
    while (nr < edges.length) {
        let e0 = edges[nr];
        nr++;
        if (nr < edges.length) {
            let e1 = edges[nr];
            if (e0.id0 === e1.id0 && e0.id1 === e1.id1) {
                neighbors[e0.edgeNr] = e1.edgeNr;
                neighbors[e1.edgeNr] = e0.edgeNr;
            }
            nr++;
        }
    }
    return neighbors;
}

export interface ClothData {
    vertices: Float32Array;
    faceTriIds: Uint32Array | Uint16Array;
}

export class ClothPhysics {
    public numParticles: number;
    public pos: Float32Array;
    public prevPos: Float32Array;
    public vel: Float32Array;
    public invMass: Float32Array;
    
    // WebGL 호환성을 위해 인덱스는 Uint32Array를 사용합니다.
    public triIds: Uint32Array | Uint16Array; 

    // Constraints
    public stretchingIds: Uint32Array;
    public bendingIds: Uint32Array;
    public stretchingLengths: Float32Array;
    public bendingLengths: Float32Array;
    
    public stretchingCompliance: number = 0.0;
    public bendingCompliance: number = 1.0;

    // Temps (임시 변수)
    private grads: Float32Array;
    
    constructor(meshData: ClothData, bendingCompliance = 1.0) {
        this.numParticles = meshData.vertices.length / 3;
        this.pos = new Float32Array(meshData.vertices);
        this.prevPos = new Float32Array(meshData.vertices);
        this.vel = new Float32Array(3 * this.numParticles);
        this.invMass = new Float32Array(this.numParticles);
        
        this.triIds = meshData.faceTriIds;
        this.bendingCompliance = bendingCompliance;
        this.stretchingCompliance = 0.001; 

        const neighbors = findTriNeighbors(this.triIds);
        const numTris = this.triIds.length / 3;
        const edgeIds = [];
        const triPairIds = [];

        for (let i = 0; i < numTris; i++) {
            for (let j = 0; j < 3; j++) {
                const id0 = this.triIds[3 * i + j];
                const id1 = this.triIds[3 * i + (j + 1) % 3];
                const n = neighbors[3 * i + j];
                
                if (n < 0 || id0 < id1) {
                    edgeIds.push(id0); edgeIds.push(id1);
                }
                if (n >= 0) {
                    const ni = Math.floor(n / 3);
                    const nj = n % 3;
                    const id2 = this.triIds[3 * i + (j + 2) % 3];
                    const id3 = this.triIds[3 * ni + (nj + 2) % 3];
                    triPairIds.push(id0); triPairIds.push(id1); triPairIds.push(id2); triPairIds.push(id3);
                }
            }
        }

        // Uint32Array로 통일하여 WebGL 에러 방지
        this.stretchingIds = new Uint32Array(edgeIds);
        this.bendingIds = new Uint32Array(triPairIds);
        this.stretchingLengths = new Float32Array(this.stretchingIds.length / 2);
        this.bendingLengths = new Float32Array(this.bendingIds.length / 4);
        this.grads = new Float32Array(4 * 3);

        this.initPhysics();
    }

    initPhysics() {
        this.invMass.fill(0.0);
        const numTris = this.triIds.length / 3;
        const e0 = [0.0, 0.0, 0.0];
        const e1 = [0.0, 0.0, 0.0];
        const c = [0.0, 0.0, 0.0];

        for (let i = 0; i < numTris; i++) {
            const id0 = this.triIds[3 * i];
            const id1 = this.triIds[3 * i + 1];
            const id2 = this.triIds[3 * i + 2];
            vecSetDiff(e0, 0, this.pos, id1, this.pos, id0);
            vecSetDiff(e1, 0, this.pos, id2, this.pos, id0);
            vecSetCross(c, 0, e0, 0, e1, 0);
            const A = 0.5 * Math.sqrt(vecLengthSquared(c, 0));
            const pInvMass = A > 0.0 ? 1.0 / A / 3.0 : 0.0;
            this.invMass[id0] += pInvMass;
            this.invMass[id1] += pInvMass;
            this.invMass[id2] += pInvMass;
        }

        for (let i = 0; i < this.stretchingLengths.length; i++) {
            const id0 = this.stretchingIds[2 * i];
            const id1 = this.stretchingIds[2 * i + 1];
            this.stretchingLengths[i] = Math.sqrt(vecDistSquared(this.pos, id0, this.pos, id1));
        }
        for (let i = 0; i < this.bendingLengths.length; i++) {
            const id0 = this.bendingIds[4 * i + 2];
            const id1 = this.bendingIds[4 * i + 3];
            this.bendingLengths[i] = Math.sqrt(vecDistSquared(this.pos, id0, this.pos, id1));
        }

        // 상단 고정
        let maxY = -Number.MAX_VALUE;
        for (let i = 0; i < this.numParticles; i++) maxY = Math.max(maxY, this.pos[3 * i + 1]);
        const eps = 0.0001;
        for (let i = 0; i < this.numParticles; i++) {
            if (this.pos[3 * i + 1] > maxY - eps) this.invMass[i] = 0.0;
        }
    }

    // --- Simulation Steps ---
    
    preSolve(dt: number, gravity: number[]) {
        for (let i = 0; i < this.numParticles; i++) {
            if (this.invMass[i] === 0.0) continue;
            
            // 💡 공기 저항 (Damping) 부분
            vecScale(this.vel, i, 0.99); 

            vecAdd(this.vel, i, gravity, 0, dt);
            vecCopy(this.prevPos, i, this.pos, i);
            vecAdd(this.pos, i, this.vel, i, dt);
            
            // 바닥 충돌 처리
            if (this.pos[3 * i + 1] < 0.0) {
                vecCopy(this.pos, i, this.prevPos, i);
                this.pos[3 * i + 1] = 0.0;
            }
        }
    }

    solve(dt: number) {
        this.solveConstraints(this.stretchingIds, this.stretchingLengths, this.stretchingCompliance, dt, 2);
        this.solveConstraints(this.bendingIds, this.bendingLengths, this.bendingCompliance, dt, 4);
    }

    solveConstraints(ids: Uint32Array, lengths: Float32Array, compliance: number, dt: number, stride: number) {
        const alpha = compliance / dt / dt;
        for (let i = 0; i < lengths.length; i++) {
            const id0 = ids[stride * i + (stride === 4 ? 2 : 0)]; 
            const id1 = ids[stride * i + (stride === 4 ? 3 : 1)];
            const w0 = this.invMass[id0];
            const w1 = this.invMass[id1];
            const w = w0 + w1;
            if (w === 0.0) continue;

            vecSetDiff(this.grads, 0, this.pos, id0, this.pos, id1);
            const len = Math.sqrt(vecLengthSquared(this.grads, 0));
            if (len === 0.0) continue;
            vecScale(this.grads, 0, 1.0 / len);
            const restLen = lengths[i];
            const C = len - restLen;
            const s = -C / (w + alpha);
            vecAdd(this.pos, id0, this.grads, 0, s * w0);
            vecAdd(this.pos, id1, this.grads, 0, -s * w1);
        }
    }

    postSolve(dt: number) {
        for (let i = 0; i < this.numParticles; i++) {
            if (this.invMass[i] === 0.0) continue;
            vecSetDiff(this.vel, i, this.pos, i, this.prevPos, i, 1.0 / dt);
        }
    }
    
    // -----------------------------------------------------------
    // 💡 Main Interaction Method 
    // applyImpulse(): 클릭 시 옷감 시뮬레이션에 힘을 가함  
    // -----------------------------------------------------------

    applyImpulse(point: number[], force: number[], radius: number = 0.5) {
        const radiusSq = radius * radius;

        for (let i = 0; i < this.numParticles; i++) {
            if (this.invMass[i] === 0.0) continue; // 고정된 점은 무시

            const px = this.pos[3 * i];
            const py = this.pos[3 * i + 1];
            const pz = this.pos[3 * i + 2];

            const dx = px - point[0];
            const dy = py - point[1];
            const dz = pz - point[2];
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < radiusSq) {
                // 거리가 가까울수록 더 강한 힘을 받음
                const falloff = 1.0 - (distSq / radiusSq);
                
                // 속도(vel)에 힘을 더함
                this.vel[3 * i]     += force[0] * falloff;
                this.vel[3 * i + 1] += force[1] * falloff;
                this.vel[3 * i + 2] += force[2] * falloff;
            }
        }
    }
}