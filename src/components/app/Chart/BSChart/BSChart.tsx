import { FC, useEffect, useMemo, useRef, useState } from 'react'
import Chart from 'chart.js/auto'

import { BSCheckbox } from '../BSCheckbox'
import { BS_CHART_DEFAULT_LINE_COLOR } from './constants'
import { makeChartInstance } from './factories'
import { BSChartProps } from './types'

const BSChart: FC<BSChartProps> = (props) => {
  const {
    hideLegend = false,
    minWidth = 'auto',
    minHeight = 'auto',
    maxWidth = 'auto',
    maxHeight = 'auto',
    className = '',
    style = {}
  } = props

  const chartElement = useRef(null)
  const [chartInstance, setChartInstance] = useState<Chart | null>(null)
  const [linesVisibilityMap, setLinesVisibilityMap] = useState<Record<number, boolean>>({})
  const [showDotChart, setShowDotChart] = useState(true)

  const isLegendVisible = (() => {
    return !!props.lines.length && !hideLegend
  })()

  const visibleLines = useMemo(() => {
    return props.lines.filter((line, lineIdx) => !!linesVisibilityMap[lineIdx])
  }, [linesVisibilityMap])

  useEffect(() => {
    if (chartInstance) chartInstance.destroy()
    createChartInstance()
  }, [
    props.labels,
    visibleLines,
    showDotChart,
    props.baseAxis,
    props.xLabel,
    props.yLabel,
    props.customization
  ])

  useEffect(() => {
    const visibilityMap: Record<number, boolean> = {}

    props.lines.forEach((line, lineIdx) => {
      visibilityMap[lineIdx] = true
    })

    setLinesVisibilityMap(visibilityMap)
  }, [props.lines])

  function createChartInstance(): void {
    let instance: Chart | null = null

    try {
      instance = makeChartInstance({
        root: chartElement.current,
        ...props,
        dots: showDotChart ? props.dots : undefined,
        lines: visibleLines
      })
    } catch (e) {
      console.error(e)
    }

    if (instance) {
      setChartInstance(instance)
    }
  }

  function changeLineVisibility(isVisible: boolean, lineIdx: number): void {
    setLinesVisibilityMap({
      ...linesVisibilityMap,
      [lineIdx]: isVisible
    })
  }

  return (
    <div className={className} style={{ ...style }}>
      <div style={{ minWidth, minHeight, maxWidth, maxHeight }}>
        <canvas id="myChart" ref={chartElement} />
      </div>

      {isLegendVisible && (
        <div className="flex gap-5 flex-wrap mt-3.5 text-grey100 text-sm ml-2.5">
          {props.lines.length > 1 &&
            props.lines.map((line, lineIdx) => (
              <BSCheckbox
                key={`chart-line__${lineIdx}`}
                value={!!linesVisibilityMap[lineIdx]}
                onChange={(isVisible: boolean) => changeLineVisibility(isVisible, lineIdx)}
                color={line.color || BS_CHART_DEFAULT_LINE_COLOR}>
                {line.name || `Line ${lineIdx + 1}`}
              </BSCheckbox>
            ))}
          {props.dots && (
            <BSCheckbox
              key={`chart-dot`}
              value={showDotChart}
              onChange={(isVisible: boolean) => setShowDotChart(isVisible)}
              color={props.dots.color}>
              {props.dots.name || `Scatter`}
            </BSCheckbox>
          )}
        </div>
      )}
    </div>
  )
}

export default BSChart
