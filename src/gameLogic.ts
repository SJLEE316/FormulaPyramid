export type Operator = '+' | '-' | '×' | '÷'

export interface Cell {
  id: string // 'A' ~ 'J'
  operator: Operator
  value: number
}

// 피라미드 레이아웃: [행][열] 순서로 A~J 배치
// 행0: A
// 행1: B, C
// 행2: D, E, F
// 행3: G, H, I, J
export const PYRAMID_LAYOUT: string[][] = [
  ['A'],
  ['B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I', 'J'],
]

const CELL_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const OPERATORS: Operator[] = ['+', '-', '×', '÷']

// 사칙연산 우선순위 적용 계산
// 수식: [숫자, 연산자, 숫자, 연산자, 숫자]
function compute(nums: number[], ops: Operator[]): number {
  const n = [...nums]
  const o = [...ops]

  // 1단계: ×, ÷ 처리
  let i = 0
  while (i < o.length) {
    if (o[i] === '×' || o[i] === '÷') {
      const result = o[i] === '×' ? n[i] * n[i + 1] : n[i] / n[i + 1]
      n.splice(i, 2, result)
      o.splice(i, 1)
    } else {
      i++
    }
  }

  // 2단계: +, - 처리
  let total = n[0]
  for (let j = 0; j < o.length; j++) {
    if (o[j] === '+') total += n[j + 1]
    else total -= n[j + 1]
  }

  return total
}

// 3칸으로 수식 계산 (첫 칸 부호 무시)
export function evaluateTriple(
  c1: Cell,
  c2: Cell,
  c3: Cell
): number {
  // 첫 번째 칸의 부호는 무시하고 숫자만 사용
  const nums = [c1.value, c2.value, c3.value]
  const ops = [c2.operator, c3.operator]
  return compute(nums, ops)
}

// 랜덤 정수 생성 (min ~ max 포함)
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 타겟 넘버가 되는 정답 조합 모두 탐색
export function findAllAnswers(cells: Cell[], target: number): string[][] {
  const answers: string[][] = []
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells.length; j++) {
      if (j === i) continue
      for (let k = 0; k < cells.length; k++) {
        if (k === i || k === j) continue
        const result = evaluateTriple(cells[i], cells[j], cells[k])
        if (Math.abs(result - target) < 1e-9) {
          answers.push([cells[i].id, cells[j].id, cells[k].id])
        }
      }
    }
  }
  return answers
}

// 라운드용 셀 + 타겟 넘버 랜덤 생성 (정답이 반드시 1개 이상 존재)
export function generateRound(): { cells: Cell[]; target: number } {
  let cells: Cell[]
  let target: number
  let answers: string[][]

  const MAX_ATTEMPTS = 1000

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    cells = CELL_IDS.map((id) => ({
      id,
      operator: OPERATORS[randInt(0, 3)],
      value: randInt(1, 9),
    }))

    // 후보 타겟 넘버: 가능한 수식들의 결과값 중 하나를 랜덤 선택
    const possibleResults = new Set<number>()
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells.length; j++) {
        if (j === i) continue
        for (let k = 0; k < cells.length; k++) {
          if (k === i || k === j) continue
          const r = evaluateTriple(cells[i], cells[j], cells[k])
          // 정수이고 -50~50 범위인 결과만 타겟 후보
          if (Number.isInteger(r) && r >= -50 && r <= 50) {
            possibleResults.add(r)
          }
        }
      }
    }

    if (possibleResults.size === 0) continue

    const candidates = Array.from(possibleResults)
    target = candidates[randInt(0, candidates.length - 1)]
    answers = findAllAnswers(cells, target)

    if (answers.length >= 1) {
      return { cells: cells!, target: target! }
    }
  }

  // fallback (거의 발생 안 함)
  return generateRound()
}
