"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import ChartLoader from "@/components/ui/ChartLoader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false, loading: () => <ChartLoader /> });

export type EChartProps = {
  option: any;
  height?: number | string;
  className?: string;
};

export default function EChart({ option, height = 360, className }: EChartProps) {
  const style = useMemo(() => ({
    height: typeof height === "number" ? `${height}px` : height,
    width: "100%",
  }), [height]);

  return (
    <ReactECharts
      option={option}
      style={style}
      notMerge={true}
      lazyUpdate={true}
      className={className}
    />
  );
}
