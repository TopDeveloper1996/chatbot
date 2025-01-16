import { theme } from "#tailwind-config";
import { breakpointsTailwind } from "@vueuse/core";

export type ChartType =
    | "donut"
    | "pie"
    | "bar"
    | "line"
    | "area"
    | "bubble"
    | "candlestick"
    | "boxplot"
    | "heatmap"
    | "treemap";

export const useChartOptions = () => {
    const tw = useTailwind();
    const bp = useBreakpoints(breakpointsTailwind);
    const getOptions = (type?: ChartType, decorator?: (config: any) => any) => {
        let baseConfig = {
            grid: {
                borderColor: tw.theme.colors.outline,
            },
            markers: {},
            title: {
                align: "center",
                style: {
                    fontSize: "18px",
                    fontFamily: "Poppins",
                },
            },
            subtitle: {
                align: "center",
                style: {
                    fontSize: "14px",
                    fontFamily: "Poppins",
                },
            },
            dataLabels: {
                enabled: bp.sm.value,
                style: {
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    fontWeight: "bold",
                    colors: [theme.colors.text],
                },
                dropShadow: {
                    enabled: false,
                },
            },
            tooltip: {
                style: { fontFamily: "Poppins", fontSize: "12px" },
                x: {},
                y: {},
            },
            colors: [
                "#AD1F1F",
                "#AD4E1F",
                "#AD7E1F",
                "#ADAD1F",
                "#7EAD1F",
                "#4EAD1F",
                "#1FAD1F",
                "#1FAD4E",
                "#1FAD7E",
                "#1FADAD",
                "#1F7EAD",
                "#1F4EAD",
                "#1F1FAD",
                "#4E1FAD",
                "#7E1FAD",
                "#AD1FAD",
                "#AD1F7E",
                "#AD1F4E",
                "#AD1F1F",
                "#AD4C1F",
            ],
            stroke: {
                curve: "straight",
                lineCap: "round",
            },
            legend: {
                position: "bottom",
                fontSize: "16px",
                floating: false,
                horizontalAlign: "start",
                markers: {
                    width: 20,
                    height: 12,
                    offsetX: -8,
                },
                itemMargin: {
                    horizontal: 16,
                },
            },
            plotOptions: {
                bar: {
                    borderRadius: 2,
                    borderRadiusApplication: "around",
                    borderRadiusWhenStacked: "all",
                },
                area: {},
                bubble: {},
                candlestick: {},
                boxPlot: {},
                heatmap: {},
                treemap: {},
                pie: {},
                polarArea: {},
                radar: {},
                radialBar: {},
            },
            chart: {
                id: "vuechart",
                type: type,
                foreColor: tw.theme.colors.text,
                toolbar: {
                    show: true,
                },
                animations: {
                    enabled: true,
                    easing: "easeinout",
                    speed: 500,
                    animateGradually: {
                        enabled: true,
                        delay: 100,
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 200,
                    },
                },
            },
            labels: [],
            xaxis: {
                labels: { style: { fontFamily: "Poppins", fontSize: "14px" } },
                axisBorder: {},
                categories: [],
            },
            yaxis: {
                labels: { style: { fontFamily: "Poppins", fontSize: "16px" } },
                axisBorder: {},
                categories: [],
            },
        };
        baseConfig = applyChartTypeDecorator(baseConfig, type);
        if (decorator) {
            baseConfig = decorator(baseConfig);
        }
        return baseConfig;
    };
    return { getOptions };
};

function applyChartTypeDecorator(baseOptions: any, type: ChartType | undefined) {
    switch (type) {
        case "donut":
            return decorateDonut(baseOptions);
        case "pie":
            return decoratePie(baseOptions);
        case "bar":
            return baseOptions;
        case "line":
            return decorateLine(baseOptions);
        case "area":
            return baseOptions;
        case "bubble":
            return baseOptions;
        case "candlestick":
            return baseOptions;
        case "boxplot":
            return baseOptions;
        case "heatmap":
            return baseOptions;
        case "treemap":
            return baseOptions;
        default:
            return baseOptions;
    }
}
function decorateLine(baseOptions: any): any {
    const bp = useBreakpoints(breakpointsTailwind);
    baseOptions.stroke.width = bp.smallerOrEqual("md").value ? 2 : 4;
    return baseOptions;
}
function decoratePie(baseOptions: any): any {
    baseOptions.plotOptions.pie = {
        expandOnClick: false,
        customScale: 1,
    };
    baseOptions.stroke = { show: false, width: 2, colors: [theme.colors.outline] };
    return baseOptions;
}
function decorateDonut(baseOptions: any): any {
    baseOptions.plotOptions.pie = {
        expandOnClick: false,
        customScale: 1,
    };
    baseOptions.stroke = { show: false, width: 2, colors: [theme.colors.outline] };
    return baseOptions;
}
