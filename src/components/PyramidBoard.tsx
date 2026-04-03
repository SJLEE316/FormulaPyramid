import { type Cell, PYRAMID_LAYOUT } from '../gameLogic'

interface PyramidBoardProps {
  cells: Cell[]
  selectedIds: string[]
  solvedIds: string[] // 이미 정답으로 사용된 칸들
  onCellClick: (id: string) => void
}

export default function PyramidBoard({
  cells,
  selectedIds,
  solvedIds,
  onCellClick,
}: PyramidBoardProps) {
  const cellMap = Object.fromEntries(cells.map((c) => [c.id, c]))

  return (
    <div className="pyramid-board">
      {PYRAMID_LAYOUT.map((row, rowIdx) => (
        <div key={rowIdx} className="pyramid-row">
          {row.map((id) => {
            const cell = cellMap[id]
            const isSelected = selectedIds.includes(id)
            const isSolved = solvedIds.includes(id)
            return (
              <button
                key={id}
                className={`pyramid-cell${isSelected ? ' selected' : ''}${isSolved ? ' solved' : ''}`}
                onClick={() => onCellClick(id)}
              >
                <span className="cell-id">{id}</span>
                <span className="cell-formula">
                  {cell.operator}{cell.value}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
