import type { IRedirectionInfo, TimeFormat } from '@cloudbees/shared-types'

export interface IChartOptions {
  type: string
  data: any
  showLegends: boolean
  colorScheme: Array<{ color0: string; color1: string; color2?: string }>
  lightColorScheme: Array<{ color0: string; color1: string; color2?: string }>
  color?: string
  title?: string
  categoryType?: string
  orientation?: string
  drillDown?: IDrillDown
  mode?: string
  timezone?: string
  timeFormat?: TimeFormat
  durationValue?: string
  chartInfo?: IChartInfo
  formatDurationInMilliSeconds?: (durationInMilliseconds: number) => string
  formatDateBasedOnTimeZone?: (value: number | string, timezone: string) => string
  handleRedirectUrl?: (redirectionInfo: IRedirectionInfo[], name?: string) => void
}

export interface IDrillDown {
  reportTitle: string
  reportId: string
  reportType?: string
  reportInfo?: IDrillDownReportInfo
  redirectionInfo?: IRedirectionInfo[]
}

export interface IDrillDownReportInfo {
  [key: string]: string
}

export interface IWidgetDrawerInfo {
  reportTitle: string
  reportId: string
  reportFilterType?: string
  reportValue?: any
  reportInfo?: IDrillDownReportInfo
  dateRange?: { startDate: string; endDate: string }
}

export interface IChartInfo {
  buildId: string
  drillDown: IDrillDown
  jobId: string
  runTime?: number
  startTime?: number
  status: string
}

export interface IBarWithBothAxis {
  type: string
  data: any
  colorScheme: Array<{ color0: string; color1: string; color2?: string }>
  color?: string
  timezone: string
  timeFormat: TimeFormat
  durationValue: string
  chartInfo: IChartInfo
  formatDurationInMilliSeconds: (durationInMilliseconds: number) => string
  formatDateBasedOnTimeZone: (
    value: number | string,
    timezone: string,
    timeFormat?: TimeFormat,
  ) => string
}

export interface ITooltipData {
  name: string
  findings: number
  findingsPercentage: number
  color?: string
}

export interface ITooltipInfo {
  severityDistribution: { title: string; data: ITooltipData[] }
  categoryDistribution: { title: string; data: ITooltipData[] }
}
