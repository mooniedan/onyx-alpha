import { FinanceItem } from "./finance-item.model";
import { GraphData } from "./graph-data.model";
import { ItemType } from "./item-type";

export class GoalItem extends FinanceItem {
    override type: ItemType = 'Goal';

    constructor(name: string, startDate: Date, startValue: number) {
        super(name, startDate, startValue);
    }

    override valuesOnDates(dates: Date[]): GraphData {
        const graphData = new GraphData();
        graphData.name = this.name;
        const values: number[] = [];
        dates.forEach((date) => {
            const startDate = this.startDateSignal?.() || new Date();
            if (date > startDate) {
                values.push(this.startValueSignal()); 
            } else {
                values.push(0);
            }
        });
        graphData.xAxisValues = dates;
        graphData.yAxisValues = values;
        if (this.subItems.length > 0) {
            this.subItems.forEach((subItem) => {
                graphData.subItemGraphData.push(subItem.valuesOnDates(dates));
            })
        }
        return graphData;
    }


}
