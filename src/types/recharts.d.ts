// src/types/recharts.d.ts
declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  export interface ChartProps {
    width?: number | string;
    height?: number | string;
    data?: any[];
    margin?: any;
    children?: ReactNode;
  }

  export interface ResponsiveContainerProps {
    width?: number | string;
    height?: number | string;
    children?: ReactNode;
  }

  export interface LineProps {
    type?: string;
    dataKey?: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: any;
    name?: string;
  }

  export interface PieProps {
    data?: any[];
    cx?: string | number;
    cy?: string | number;
    labelLine?: boolean;
    label?: any;
    outerRadius?: number;
    fill?: string;
    dataKey?: string;
    children?: ReactNode;
  }

  export interface AxisProps {
    dataKey?: string;
  }

  export interface TooltipProps {
    formatter?: (value: any, name?: string | undefined, props?: any) => any;
  }

  export interface CellProps {
    fill?: string;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
  }

  export interface LegendProps {}

  export interface PieLabelRenderProps {
    name: string;
    percent?: number;
    value: number;
  }

  export const LineChart: ComponentType<ChartProps>;
  export const Line: ComponentType<LineProps>;
  export const XAxis: ComponentType<AxisProps>;
  export const YAxis: ComponentType<AxisProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const PieChart: ComponentType<ChartProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
}