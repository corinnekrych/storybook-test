import { alpha, useTheme } from '@mui/material/styles'
import * as echarts from 'echarts'
import i18next from 'i18next'

import {
  APPEND_TEXT,
  APPEND_UNIT,
  BAR,
  BAR_WITH_BOTH_AXIS,
  BOX_PLOT,
  DONUT,
  HALF_DONUT,
  HORIZONTAL_BAR,
  LABEL_LINE,
  LINE,
  MULTIPLE_BAR,
  MULTIPLE_Y_AXES,
  ORIENTATION_HORIZONTAL,
  ORIENTATION_VERTICAL,
  RUN_ACTIVITY_STATUS,
  SINGLE_BAR_V1,
  SINGLE_WITH_MULTI_COLOR,
  STACKED_BAR,
  TIME_DURATION,
} from './constants'
import type { IBarWithBothAxis, IChartOptions, ITooltipData, ITooltipInfo } from './types'

const t = (key: string) => i18next.t(`charts.${key}`, { ns: 'platform-analytics' })

const TooltipStyle = () => {
  const theme = useTheme()
  return {
    textStyle: {
      color: '#FFF',
    },
    backgroundColor: alpha(theme.palette.grey[700], 0.92),
    borderRadius: 4,
    borderWidth: 0,
  }
}

const commonOptions = ({ type, data, showLegends, color, title, categoryType }: IChartOptions) => {
  return {
    itemStyle: {
      borderRadius: 3,
    },
    ...(title && {
      title: {
        text: title,
        textStyle: {
          color,
          fontWeight: 500,
          fontSize: 14,
        },
      },
    }),
    tooltip: {
      ...TooltipStyle(),
      confine: true,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '2%',
      top: title ? 40 : 10,
      right: 20,
      bottom: showLegends ? 60 : 25,
    },
    ...(showLegends && {
      legend: {
        bottom: 10,
        right: 30,
        icon: 'circle',
        textStyle: {
          color,
          fontWeight: 400,
          fontSize: 12,
        },
      },
    }),
    xAxis: [
      {
        type: 'category',
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        data:
          type === BAR || categoryType === SINGLE_WITH_MULTI_COLOR
            ? data && data.map((x: { id: any }) => x.id)
            : data && data.find((x: any) => x)
            ? [
                ...new Set(
                  data?.flatMap(
                    (item: { data: any[] }) => item?.data?.map(dataPoint => dataPoint.x) || [],
                  ),
                ),
              ]
            : [],
        axisLabel: {
          textStyle: {
            color,
          },
        },
      },
    ],
    yAxis: [
      {
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        type: 'value',
        axisLabel: {
          textStyle: {
            align: 'centre',
            color,
          },
        },
      },
    ],
  }
}

const createGradient = (
  colorScheme: Array<{ color0: string; color1: string }>,
  index: number,
  type?: string,
) => {
  const gradientOptions = {
    [MULTIPLE_BAR]: (colorScheme: Array<{ color0: string; color1: string }>, index: number) => {
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
    [BAR]: (colorScheme: Array<{ color0: string; color1: string }>, index: number) => {
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
    [MULTIPLE_Y_AXES]: (colorScheme: Array<{ color0: string; color1: string }>, index: number) => {
      return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
    [STACKED_BAR]: (colorScheme: Array<{ color0: string; color1: string }>, index: number) => {
      return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
    [BAR_WITH_BOTH_AXIS]: (
      colorScheme: Array<{ color0: string; color1: string }>,
      index: number,
    ) => {
      return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
    default: (colorScheme: Array<{ color0: string; color1: string }>, index: number) => {
      return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: colorScheme[index]?.color0 }, // Gradient starting color
        { offset: 1, color: colorScheme[index]?.color1 }, // Gradient ending color
      ])
    },
  }
  const gradient = gradientOptions[type ?? 'default']
  return gradient(colorScheme, index)
}

// Custom boxplot tooltip formatter function
export const boxPlotTooltipFormatter = (params: any) => {
  const getParams = Array.isArray(params) ? params.find((item: any) => item) : params
  // Check if getParams is an object with the expected properties
  if (getParams && getParams.name && getParams.value && getParams.seriesName) {
    if (Array.isArray(getParams.value) && getParams.value.length >= 5) {
      // Format each value separately
      const formattedMin = formatTimeDuration(getParams?.value[1])
      const formattedMedian = formatTimeDuration(getParams?.value[3])
      const formattedMax = formatTimeDuration(getParams?.value[5])
      const colorCircle = `<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:${getParams?.color}"></span>`
      return `
 <div style="width: 100%">
 <div style="text-align: left;">${colorCircle} ${getParams.name}</div>
 ${
   formattedMin &&
   `
 <div style="display: flex; justify-content: space-between">
 <div style="text-align: left;">Min</div>
 <div style="text-align: right; font-weight: bold;">${formattedMin}</div>
 </div>
 `
 }
 ${
   formattedMedian &&
   `
 <div style="display: flex; justify-content: space-between">
 <div style="text-align: left;">Median</div>
 <div style="text-align: right; font-weight: bold;">${formattedMedian}</div>
 </div>
 `
 }
 ${
   formattedMax &&
   `
 <div style="display: flex; justify-content: space-between">
 <div style="text-align: left;">Max</div>
 <div style="text-align: right; font-weight: bold;">${formattedMax}</div>
 </div>
 `
 }
 </div>
 `
    }
  }
  return `<div>${getParams?.name}</div><br><div>${getParams?.seriesName}</div>`
}
export const getDataBasedOnIndex = (item: any, data: any) => {
  const yIndex = item?.dataIndex
  const dataObject = data?.find((x: { id: any }) => x?.id === item?.seriesName)?.data || []
  return dataObject[yIndex]
}
const toolTipFormatContent = (params: any, yAxisFormatter: any, data?: any) => {
  let toolTipContent = '',
    tooltipTitle = ''
  params.forEach((item: any) => {
    const colorCircle = `<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:${
      item?.color?.colorStops[item.axisIndex]?.color
    }"></span>`
    const yAxisToolTipFormatterType = yAxisFormatter[item?.seriesIndex]
    const toolTipFormattedValue = formatMultipleYAxisValue(item?.value, yAxisToolTipFormatterType)
    const zValue = getDataBasedOnIndex(item, data)?.z
    const dateRange = getDataBasedOnIndex(item, data)?.date
    tooltipTitle = `${
      dateRange
        ? `<label>${dateRange?.startDate} - ${dateRange?.endDate}</label>`
        : `<label>${item?.name}</label>`
    }`
    toolTipContent += `
 <div style="display: flex; justify-content: space-between; width: 100%">
                <div style="text-align: left; padding-right: 20px;">${colorCircle} ${
      item?.seriesName
    }</div>
 ${
   zValue
     ? `
 <div style="text-align: right; font-weight: bold;">${zValue}</div>
 `
     : ''
 }${
      toolTipFormattedValue
        ? `
 <div style="text-align: right; font-weight: bold;">${toolTipFormattedValue}</div>`
        : `<div style="text-align: right; font-weight: bold;">0</div>`
    }
 </div>
 `
  })
  return tooltipTitle + toolTipContent
}

const renderTooltipSection = (title: string, data: ITooltipData[]) => {
  return (
    data &&
    data.length &&
    `<div>
         <div style="color: #ccc; font-weight: 500; margin-bottom: 2px;">${title}</div>
         ${data
           ?.map(item => {
             const colorDot = item?.color
               ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item?.color}; margin-right:10px;"></span>`
               : ''
             return `<div style="display:flex; align-items:center; margin-top:4px; margin-left:15px;">
                        ${colorDot}
                        <span style="flex: 1;margin-right:15px;font-weight:600">${item?.name}</span>
                        <span style="color: #ccc">${item?.findings} findings - ${item?.findingsPercentage}%</span>
                     </div>`
           })
           .join('')}
       </div>`
  )
}

export const formatTimeDuration = (value: number) => {
  const seconds = value / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  switch (true) {
    case minutes >= 1 && minutes < 60:
      return `${Math.floor(minutes)}m`
    case hours >= 1 && hours < 24:
      return `${Math.floor(hours)}h`
    case days >= 1:
      return `${Math.floor(days)}d`
    default:
      return `${seconds}s`
  }
}
// Format Multiple Y axis chart, Y axis label as desired format based on the yAxisFormatter type from response
const formatMultipleYAxisValue = (value: number, yAxisFormatter: any) => {
  switch (yAxisFormatter?.type) {
    case TIME_DURATION:
      return formatTimeDuration(value)
    case APPEND_UNIT:
      return `${value}${yAxisFormatter?.appendUnitValue}`
    case APPEND_TEXT:
      return `${value} ${yAxisFormatter?.appendUnitValue}`
    default:
      return value
  }
}

const getFormattedYAxisValue = (values: number, yAxisFormatterType: any) => {
  const formattedValue = formatMultipleYAxisValue(values, yAxisFormatterType)
  const stringValue = formattedValue.toString()
  return stringValue.length > 5 ? stringValue.slice(0, 4) + '...' : stringValue
}

const parseDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const chartOptions = {
  [LINE]: ({ type, data, showLegends, colorScheme, color, title, categoryType }: IChartOptions) => {
    const yAxisFormatter = data?.map((item: any) => item?.yAxisFormatter)
    const xAxisLabelData =
      categoryType === LABEL_LINE
        ? data
            ?.find((item: { data: { x: string }[] }) => item?.data?.length)
            ?.data?.map(({ x }: { x: string }) => x) || []
        : type === BAR || categoryType === SINGLE_WITH_MULTI_COLOR
        ? data && data.map((x: { id: any }) => x.id)
        : data && data.find((x: any) => x)
        ? [
            ...new Set(
              data?.flatMap(
                (item: { data: any[] }) => item?.data?.map(dataPoint => dataPoint.x) || [],
              ),
            ),
          ]
        : []

    return {
      ...commonOptions({ type, data, showLegends, color, title } as IChartOptions),
      grid: {
        left: categoryType === LABEL_LINE ? 30 : '12%',
        top: '10%',
        right: categoryType === LABEL_LINE ? 65 : 20,
        ...(categoryType === LABEL_LINE && { containLabel: true, bottom: '14%' }),
      },
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          return toolTipFormatContent(params, yAxisFormatter, data)
        },
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: categoryType === LABEL_LINE ? false : true,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          data: xAxisLabelData,
          axisLabel: {
            textStyle: {
              color,
            },
          },
        },
      ],
      yAxis: yAxisFormatter?.map((yAxisFormatterType: any) => {
        return {
          type: 'value',
          alignTicks: false,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            ...(categoryType === LABEL_LINE && { padding: [0, 20, 0, 0] }),
            textStyle: {
              color,
            },
            ...(categoryType !== LABEL_LINE && {
              formatter: (values: number) => getFormattedYAxisValue(values, yAxisFormatterType),
            }),
          },
        }
      }),
      series: data?.map((info: any, index: number) => ({
        name: info.id,
        data: info?.data?.map((item: { y: any }) => item.y),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 9,
        color: createGradient(colorScheme, index),
        silent: info?.isClickDisable,
        ...(categoryType === LABEL_LINE && {
          animationDuration: 200,
          animationEasing: 'linear',
        }),
      })),
    }
  },
  [MULTIPLE_Y_AXES]: ({ type, data, showLegends, colorScheme, color, title }: IChartOptions) => {
    const yAxisFormatter = data?.map((item: any) => item?.yAxisFormatter)
    return {
      ...commonOptions({ type, data, showLegends, color, title } as IChartOptions),
      grid: {
        left: '7%',
        top: '10%',
      },
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          return toolTipFormatContent(params, yAxisFormatter, data)
        },
      },
      barWidth: 20,
      xAxis: [
        {
          type: 'category',
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              color,
            },
          },
          data: [
            ...new Set(
              data?.flatMap((item: { data: any[] }) => item?.data?.map(dataPoint => dataPoint.x)),
            ),
          ],
        },
      ],
      yAxis: yAxisFormatter?.map((yAxisFormatterType: any, index: number) => {
        return {
          type: 'value',
          alignTicks: false,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              align: 'center',
              color: colorScheme[index]?.color2,
            },
            formatter: (values: number) => {
              return formatMultipleYAxisValue(values, yAxisFormatterType)
            },
          },
        }
      }),
      series: data?.map((info: any, index: number) => {
        return {
          name: info?.id,
          data: info?.data?.map((item: { y: any }) => item.y),
          type: info?.type,
          smooth: true,
          symbol: 'circle',
          symbolSize: 9,
          color: createGradient(colorScheme, index, type),
          yAxisIndex: index,
          silent: info?.isClickDisable,
        }
      }),
    }
  },
  [MULTIPLE_BAR]: ({ type, data, showLegends, colorScheme, color, title }: IChartOptions) => {
    const yAxisFormatter = data?.map((item: any) => item?.yAxisFormatter)
    return {
      ...commonOptions({ type, data, showLegends, color, title } as IChartOptions),
      grid: {
        top: '10%',
        left: '8%',
      },
      barGap: '30%',
      barWidth: 10,
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          return toolTipFormatContent(params, yAxisFormatter, data)
        },
      },
      yAxis: yAxisFormatter?.map((yAxisFormatterType: any) => {
        return {
          type: 'value',
          alignTicks: false,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              color,
            },
            formatter: (values: number) => {
              return formatMultipleYAxisValue(values, yAxisFormatterType)
            },
          },
        }
      }),
      series: data?.map((info: any, index: number) => ({
        name: info.id,
        data: info?.data?.map((item: { y: any }) => item.y),
        type: 'bar',
        color: createGradient(colorScheme, index, type),
      })),
    }
  },
  [BAR]: ({ type, data, showLegends, colorScheme, color, title, orientation }: IChartOptions) => {
    const yAxisFormatter = data?.find(
      (item: {
        yAxisFormatter: {
          appendUnitValue: string
          type: string
        }
      }) => item,
    )?.yAxisFormatter
    return {
      ...commonOptions({ type, data, showLegends, color, title } as IChartOptions),
      barWidth: 20,
      grid: {
        top: '10%',
        left: '10%',
      },
      tooltip: {
        ...TooltipStyle(),
        axisPointer: {
          type: 'shadow',
        },
        confine: true,
        formatter: (params: {
          value: number
          marker: string
          data: {
            percentage?: number
            name: string
          }
        }) => {
          const percentage = params?.data?.percentage ? `${params?.data?.percentage}%` : ''
          return `${params?.marker} ${
            params?.data?.name
          } ${percentage} <b>${formatMultipleYAxisValue(params?.value, yAxisFormatter)}</b>`
        },
      },
      ...(orientation === ORIENTATION_VERTICAL && {
        grid: {
          left: 20,
          top: 30,
          right: 10,
          bottom: 40,
        },
        xAxis: {
          type: 'category',
          data: data?.map((item: { id: string; value: number }) => `${item.id}`),
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              color,
            },
          },
        },
      }),
      ...(orientation === ORIENTATION_HORIZONTAL && {
        grid: {
          left: 90,
          top: 30,
          right: 40,
          bottom: 5,
        },
        xAxis: {
          type: 'value',
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          position: 'top',
          axisLabel: {
            textStyle: {
              color,
            },
          },
        },
        yAxis: {
          type: 'category',
          data: data?.map((item: { id: string; value: number }) => `${item.id} (${item.value})`),
          inverse: true,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            formatter: (value: string) => {
              return value.length > 20 ? `${value.slice(0, 15)}...` : value
            },
            margin: 90,
            align: 'left',
            textStyle: {
              color,
            },
          },
        },
      }),
      series: [
        {
          data: data?.map(
            (item: { id: string; value: number; percentage?: number }, index: number) => ({
              name: item?.id,
              value: item?.value,
              itemStyle: {
                color: createGradient(colorScheme, index),
              },
              percentage: item?.percentage,
            }),
          ),
          type: 'bar',
          boxWidth: 18,
        },
      ],
    }
  },
  [DONUT]: ({ data, colorScheme, color, categoryType }: IChartOptions) => ({
    barGap: '30%',
    barWidth: 10,
    smooth: true,
    itemStyle: {
      borderRadius: 3,
    },
    tooltip: {
      ...TooltipStyle(),
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    series: [
      {
        type: 'pie',
        radius: categoryType === LABEL_LINE ? ['40%', '60%'] : ['35%', '50%'],
        labelLine: {
          show: categoryType === LABEL_LINE ? true : false,
          length: categoryType === LABEL_LINE ? 10 : 0,
        },
        label: {
          position: 'outside',
          formatter: (params: { percent: number; name: string }) => {
            const value = params.percent
            return `{a|${
              categoryType === LABEL_LINE ? `${params?.name} - ${value}%` : `${value}%`
            }}`
          },
          rich: {
            a: {
              fontSize: 12,
            },
          },
          color,
        },
        data: data,
        color: data?.map((_: any, index: number) => createGradient(colorScheme, index)),
      },
    ],
  }),
  [HALF_DONUT]: ({ data, colorScheme, color }: IChartOptions) => ({
    series: [
      {
        type: 'pie',
        radius: ['65%', '100%'],
        center: ['50%', '70%'],
        startAngle: 180,
        endAngle: 360,
        label: {
          position: 'outside',
          formatter: (params: { name: string; value: number }) => {
            return `{a|${params?.name} - ${params?.value}%}`
          },
          rich: {
            a: {
              fontSize: 12,
            },
          },
          color,
        },
        data: data,
        color: data?.map((_: any, index: number) => createGradient(colorScheme, index)),
      },
    ],
  }),
  [HORIZONTAL_BAR]: ({ data, colorScheme, color, showLegends, title, mode }: IChartOptions) => {
    const yAxisFormatter = data?.map((item: any) => item?.yAxisFormatter)
    return {
      itemStyle: {
        borderRadius: 2,
      },
      ...(title && {
        title: {
          text: title,
          textStyle: {
            color,
            fontWeight: 500,
            fontSize: 14,
          },
        },
      }),
      barGap: '70%',
      barWidth: 15,
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          return toolTipFormatContent(params, yAxisFormatter)
        },
      },
      grid: {
        top: title ? 40 : 10,
        bottom: 30,
        right: 30,
        left: 110,
      },
      ...(showLegends && {
        legend: {
          bottom: 10,
          right: 20,
          icon: 'circle',
          textStyle: {
            color,
            fontWeight: 400,
            fontSize: 12,
          },
        },
      }),
      yAxis: [
        {
          type: 'category',
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          data: [
            ...new Set(
              data?.flatMap((item: { data: any[] }) => item?.data?.map(dataPoint => dataPoint.x)),
            ),
          ],
          axisLabel: {
            align: 'left',
            margin: 105,
            textStyle: {
              color,
            },
          },
        },
      ],
      xAxis: [
        {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          type: 'value',
          axisLabel: {
            show: false,
          },
        },
      ],
      series: data?.map((info: any, index: number) => {
        return {
          label: {
            position: 'right',
            show: true,
            formatter: (params: any) => {
              return formatMultipleYAxisValue(params?.value, info?.yAxisFormatter)
            },
            color,
          },
          showBackground: true,
          backgroundStyle: {
            color: mode === 'dark' ? '#3D3D3D' : '#E0E0E0',
          },
          name: info.id,
          data: info?.data?.map(
            (item: {
              y: any
              colorScheme: Array<{ color0: string; color1: string }>
              lightColorScheme: Array<{ color0: string; color1: string }>
            }) => {
              const modeColorScheme =
                mode === 'dark' ? item.colorScheme : item.lightColorScheme || item.colorScheme
              if (modeColorScheme) {
                return {
                  value: item.y,
                  itemStyle: {
                    color: createGradient(modeColorScheme, index),
                  },
                }
              } else {
                return item.y
              }
            },
          ),
          type: 'bar',
          color: createGradient(colorScheme, index),
        }
      }),
    }
  },
  [BOX_PLOT]: ({
    type,
    data,
    colorScheme,
    color,
    showLegends,
    title,
    categoryType,
    orientation,
  }: IChartOptions) => ({
    ...commonOptions({ type, data, showLegends, color, title, categoryType } as IChartOptions),
    tooltip: {
      ...TooltipStyle(),
      trigger: orientation === ORIENTATION_HORIZONTAL ? 'item' : 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: boxPlotTooltipFormatter,
    },
    ...(orientation === ORIENTATION_HORIZONTAL && {
      grid: {
        left: 90,
        top: title ? 40 : 10,
        right: 40,
        bottom: showLegends ? 60 : 25,
      },
      yAxis: [
        {
          type: 'category',
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          data:
            type === BAR || categoryType === SINGLE_WITH_MULTI_COLOR
              ? data && data.map((x: { id: any }) => x.id)
              : data && data.find((x: any) => x)
              ? [
                  ...new Set(
                    data?.flatMap((item: { data: any[] }) =>
                      item?.data?.map(dataPoint => dataPoint.x),
                    ),
                  ),
                ]
              : [],
          axisPointer: {
            show: true,
            type: 'shadow',
          },
          axisLabel: {
            formatter: (value: string) => {
              return value.length > 15 ? `${value.slice(0, 12)}...` : value
            },
            margin: 90,
            align: 'left',
            textStyle: {
              color,
            },
          },
        },
      ],
      xAxis: [
        {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          type: 'value',
          min: data && Number(data?.find((item: any) => item)?.min),
          max: data && Number(data?.find((item: any) => item)?.max),
          axisLabel: {
            formatter: (value: number) => {
              return formatTimeDuration(value)
            },
            textStyle: {
              align: 'centre',
              color,
            },
          },
        },
      ],
    }),
    ...(orientation === ORIENTATION_VERTICAL && {
      yAxis: [
        {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              return formatTimeDuration(value)
            },
            textStyle: {
              align: 'centre',
              color,
            },
          },
        },
      ],
    }),
    series:
      categoryType === SINGLE_WITH_MULTI_COLOR
        ? [
            {
              data: data?.map((item: { value: number; id: string }, index: number) => ({
                name: item.id,
                value: item.value,
                itemStyle: {
                  borderColor: colorScheme[index]?.color2,
                  color: createGradient(colorScheme, index),
                },
              })),
              type: 'boxplot',
              boxWidth: 18,
            },
          ]
        : data?.map((info: any, index: number) => ({
            boxWidth: 18,
            name: info.id,
            data: info?.data?.map((item: { y: any }) => item.y),
            type: 'boxplot',
            itemStyle: {
              borderColor: colorScheme[index]?.color2,
              color: createGradient(colorScheme, index),
            },
          })),
  }),
  [STACKED_BAR]: ({ type, data, showLegends, colorScheme, color }: IChartOptions) => {
    const yAxisFormatter = data?.map((item: any) => item?.yAxisFormatter)
    return {
      ...commonOptions({ type, data, showLegends, color } as IChartOptions),
      barWidth: 20,
      grid: {
        top: '10%',
        left: '10%',
      },
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          return toolTipFormatContent(params, yAxisFormatter, data)
        },
      },
      yAxis: yAxisFormatter?.map((yAxisFormatterType: any) => {
        return {
          type: 'value',
          alignTicks: false,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              color,
            },
            formatter: (values: number) => {
              return formatMultipleYAxisValue(values, yAxisFormatterType)
            },
          },
        }
      }),
      series: data?.map((info: any, index: number) => ({
        name: info.id,
        data: info?.data?.map((item: { y: any }) => item.y),
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        color: createGradient(colorScheme, index, type),
      })),
    }
  },
  [BAR_WITH_BOTH_AXIS]: ({
    data,
    colorScheme,
    color,
    type,
    timezone,
    durationValue,
    chartInfo,
    formatDurationInMilliSeconds,
    formatDateBasedOnTimeZone,
    timeFormat,
  }: IBarWithBothAxis) => {
    const minDate = durationValue && parseDate(durationValue?.split(' - ')[1])

    const getFormattedYAxisValue = (value: number) => {
      if (value === null) return null
      const formattedValue = formatDurationInMilliSeconds(value)
      const stringValue = formattedValue.toString()
      return stringValue.length > 7 ? stringValue.slice(0, 7) + '...' : stringValue
    }

    const averageRunTime =
      data
        .map((run: { runTime: any }) => run?.runTime)
        .reduce((sum: any, runTime: any) => sum + runTime, 0) / data?.length

    return {
      grid: {
        left: 60,
        top: 50,
        right: 20,
        bottom: 75,
      },
      legend: {
        bottom: 10,
        right: 2,
        icon: 'circle',
        textStyle: {
          color,
          fontWeight: 400,
          fontSize: 12,
        },
      },
      tooltip: {
        ...TooltipStyle(),
        confine: true,
        trigger: 'item',
        formatter: function (params: { data: any }) {
          const tooltipData = data?.find(
            (x: { buildId: number; jobId: string }) =>
              x?.buildId === params?.data?.buildId && x?.jobId === params?.data?.jobId,
          )
          return `
 <b>${t('build-id')}: </b> ${tooltipData?.buildId}
 <br><b>${t('run-date-and-time')}: </b>${formatDateBasedOnTimeZone(
            tooltipData?.startTime,
            timezone ?? '',
            timeFormat,
          ).toLocaleString()}
 <br><b>${t('run-duration')}: </b> ${formatDurationInMilliSeconds(tooltipData?.runTime)}
 `
        },
      },
      yAxis: {
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        type: 'value',
        axisLabel: {
          textStyle: {
            color,
          },
          formatter: (value: number) => {
            return value ? getFormattedYAxisValue(value) : null
          },
        },
      },
      xAxis: {
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        type: 'time',
        min: minDate,
        axisLabel: {
          hideOverlap: true,
          textStyle: {
            color,
          },
          formatter: function (value: string | number | Date) {
            const date = new Date(value)
            const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
            const day = date.getDate()
            return date.getHours() === 0 ? ` ${month} ${day} ` : ''
          },
        },
      },
      toolbox: {
        show: true,
        feature: {
          restore: {},
        },
      },
      dataZoom: [
        {
          type: 'inside',
          filterMode: 'empty',
        },
      ],
      series: RUN_ACTIVITY_STATUS.map((status, index) => ({
        name: status,
        data: data
          ?.filter((x: { status: string }) => x?.status === status)
          ?.map(
            (data: {
              startTime: number
              runId: number
              runTime: number
              jobId: string
              buildId: string
            }) => {
              const date = new Date(formatDateBasedOnTimeZone(data?.startTime, timezone ?? ''))
              return {
                buildId: data?.buildId,
                jobId: data?.jobId,
                value: [
                  new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes(),
                    date.getSeconds(),
                  ),
                  data?.runTime,
                ],
                itemStyle: {
                  ...(data?.buildId === chartInfo?.buildId && data?.jobId === chartInfo?.jobId
                    ? { borderColor: color, borderWidth: 2 }
                    : {}),
                },
              }
            },
          ),
        type: 'bar',
        markLine: {
          data: [
            {
              type: 'average',
              yAxis: averageRunTime,
              label: {
                normal: {
                  formatter: function (params: any) {
                    return `${t('avg-run-time')} : ${formatDurationInMilliSeconds(
                      params?.data?.value,
                    )}`
                  },
                  show: true,
                  textStyle: {
                    color: color,
                  },
                },
              },
              lineStyle: {
                color: color,
              },
            },
          ],
          emphasis: {
            disabled: true,
          },
          silent: true,
          symbol: ['none', 'none'],
          label: {
            position: 'insideEndTop',
          },
          tooltip: {
            show: false,
          },
        },
        cursor: 'pointer',
        barWidth: 10,
        itemStyle: {
          barBorderRadius: [1.5, 1.5, 0, 0],
        },
        color: createGradient(colorScheme, index, type),
      })),
    }
  },
  [SINGLE_BAR_V1]: ({ data, colorScheme, color, title }: IChartOptions) => {
    return {
      barWidth: 22,
      title: {
        text: title,
        textStyle: {
          color,
          fontWeight: 400,
          fontSize: 14,
        },
      },
      grid: {
        left: 10,
        top: 50,
        right: 10,
        bottom: 5,
      },
      tooltip: {
        ...TooltipStyle(),
        axisPointer: {
          type: 'shadow',
        },
        confine: true,
        formatter: (params: { data: { tooltipInfo: ITooltipInfo } }) =>
          Object.values(params?.data?.tooltipInfo)
            .map(section => renderTooltipSection(section?.title, section?.data))
            .join(''),
      },
      xAxis: {
        type: 'value',
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        position: 'top',
        axisLabel: {
          textStyle: {
            color,
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data?.map((item: { id: string; value: number }) => `${item.id} (${item.value})`),
        inverse: true,
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          data: data?.map(
            (item: { id: string; value: number; tooltipInfo: ITooltipInfo }, index: number) => ({
              name: item?.id,
              value: item?.value,
              itemStyle: {
                color: createGradient(colorScheme, index),
              },
              tooltipInfo: item?.tooltipInfo,
            }),
          ),
          type: 'bar',
          label: {
            position: 'insideLeft',
            show: true,
            fontWeight: 'bold',
            color: color,
            formatter: (params: { name: string }) => `${params.name}`,
          },
        },
      ],
    }
  },
}

export const getChartOptions = (options: IChartOptions) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme()
  const color =
    theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
  const {
    type,
    data,
    showLegends,
    colorScheme,
    title,
    categoryType,
    orientation,
    lightColorScheme,
    timezone,
    durationValue,
    chartInfo,
    formatDurationInMilliSeconds,
    formatDateBasedOnTimeZone,
    timeFormat,
  } = options
  const chartOption = chartOptions[type]

  const modeColorScheme =
    theme.palette.mode === 'dark' ? colorScheme : lightColorScheme || colorScheme
  if (chartOption && data)
    return chartOption({
      type,
      data,
      showLegends,
      colorScheme: modeColorScheme,
      color,
      title,
      categoryType,
      orientation,
      mode: theme.palette.mode,
      durationValue,
      timezone,
      chartInfo,
      formatDurationInMilliSeconds,
      formatDateBasedOnTimeZone,
      timeFormat,
    })
  return null
}
