import { useCallback } from 'react'
import ReactEcharts from 'echarts-for-react'

import { getChartOptions, getDataBasedOnIndex } from './ChartOptions'
import { BAR_WITH_BOTH_AXIS, DONUT, REDIRECT_URL } from './constants'
import type { IChartInfo, IChartOptions, IWidgetDrawerInfo } from './types'

export const Charts = (
  options: IChartOptions,
  handleWidgetDrawerOpen?: (info: IWidgetDrawerInfo[]) => void,
  handleChartInfo?: (chartInfo: IChartInfo) => void,
) => {
  const { drillDown, data, type, handleRedirectUrl } = options
  const handleChartClick = useCallback(
    (params: any) => {
      if (drillDown?.reportId === REDIRECT_URL && handleRedirectUrl)
        handleRedirectUrl(drillDown?.redirectionInfo ?? [], params?.name)
      else if (drillDown?.reportId && handleWidgetDrawerOpen) {
        const dateRange = getDataBasedOnIndex(params, data)?.date || {}
        handleWidgetDrawerOpen([
          {
            reportTitle: drillDown.reportTitle,
            reportId: drillDown.reportId,
            reportFilterType: drillDown.reportType,
            reportValue:
              dateRange && Object.keys(dateRange).length > 0
                ? params.seriesName
                : { name: params.name, seriesName: params.seriesName },
            reportInfo: drillDown.reportInfo,
            dateRange,
          },
        ])
      } else if (type === BAR_WITH_BOTH_AXIS) {
        const selectedInfo = data?.find(
          (chartData: IChartInfo) =>
            chartData?.buildId === params?.data?.buildId &&
            chartData?.jobId === params?.data?.jobId,
        )
        selectedInfo?.drillDown && handleChartInfo && handleChartInfo(selectedInfo)
      }
    },
    [data],
  )

  const handleRestore = useCallback(() => {
    if (type === BAR_WITH_BOTH_AXIS) {
      const selectedInfo = data?.find((chartData: IChartInfo) => chartData)
      selectedInfo?.drillDown && handleChartInfo && handleChartInfo(selectedInfo)
    }
  }, [])

  if (
    data === null ||
    data?.length === 0 ||
    (type === DONUT && data?.every((item: { value: number }) => item?.value === 0))
  )
    return null

  return (
    <ReactEcharts
      style={{ height: '100%', width: '100%' }}
      onEvents={{
        click: handleChartClick,
        restore: handleRestore,
      }}
      option={getChartOptions(options)}
    />
  )
}
