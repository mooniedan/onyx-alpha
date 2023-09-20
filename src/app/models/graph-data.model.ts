export class GraphData {
    name: string;
    xAxisValues: any[];
    yAxisValues: number[];
    subItemGraphData: GraphData[];

    yAxisTotalValues(): number[] {
        const totalValues = [...this.yAxisValues];
        this.subItemGraphData.forEach((subItemGraphData) => {
            for (let i = 0; i < totalValues.length; i++) {
                totalValues[i] = Math.floor(totalValues[i]) + Math.floor(subItemGraphData.yAxisTotalValues()[i]);
            };
        });
        return totalValues;
    }

    constructor() {
        this.name = '';
        this.xAxisValues = [];
        this.yAxisValues = [];
        this.subItemGraphData = [];
    }

    toCSV(): string {
        const csv: string[] = [];
        const years = this.xAxisValues.map((date) => date.getFullYear());
        const headerStr = `Dates, ${years.join(',')}`;
        csv.push(headerStr);
        csv.push(...this.rowsToCSV(this));
        return csv.join('\n');
    }

    rowsToCSV(graphData: GraphData): string[] {
        const rowData: string[] = [];
        const roundedValues = graphData.yAxisValues.map((value) => Math.floor(value));
        const thisRow = `${graphData.name}, ${roundedValues.join(',')}`;
        rowData.push(thisRow);
        if (graphData.subItemGraphData.length > 0) {
            graphData.subItemGraphData.forEach((subItemGraphData) => {
                rowData.push(...this.rowsToCSV(subItemGraphData));
            });
        }
        return rowData;
    }
}
