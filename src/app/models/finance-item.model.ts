import { WritableSignal, Signal, signal, computed, effect } from "@angular/core";
import { Input } from "./input.model";
import { Utils } from "../utils";
import { Frequency } from "./frequency";
import { GraphData } from "./graph-data.model";
import { ItemType } from "./item-type";

export class FinanceItem {
    name: string;
    type: ItemType = 'Default';
    readonly startValueSignal = signal(0);
    readonly startDateSignal = signal(new Date());
    endDateSignal?: WritableSignal<Date> | undefined;
    subItems: FinanceItem[] = [];
    inputs?: Input[];
    frequencySignal: WritableSignal<Frequency> = signal('month');
    subItemTrackerSignal = signal(0);

    subItemsStartTotal?: Signal<number> = computed(() => {
        let total = 0
        this.subItems.forEach((subItem) => {
            const itemValue = subItem.startValueSignal() || 0;
            const subItemsStartTotal = subItem.subItemsStartTotal?.();
            if (subItemsStartTotal) {
                total += Number(subItemsStartTotal);
            }
            else {
                total += Number(itemValue);
            }
        });
        return total;
    });

    monthlyValueSignal = computed(() => {
        const startValue = this.startValueSignal();
        switch (this.frequencySignal()) {
            case 'year': return startValue / 12;
            case 'quarter': return startValue / 4;
            case '6 months': return startValue / 6;
            case '4 weeks': return startValue * 13 / 12;
            case '2 weeks': return startValue * 26 / 12;
            case 'week': return startValue * 52 / 12;
            case 'month':
            default: return startValue;
        }
    })

    totalMonthlyValueSignal = computed(() => {
        if (this.subItemTrackerSignal() || this.subItems.length) {
            let subItemMonthlyValueTotal = 0;
            this.subItems.forEach((subItem) => {
                subItemMonthlyValueTotal += Number(subItem.totalMonthlyValueSignal());
            });
            return subItemMonthlyValueTotal;
        }
        return this.monthlyValueSignal();
    })


    subItemsValueOnDate(date: Date): number {
        return 0;
    }

    valuesOnDates(dates: Date[]): GraphData {
        const graphData = new GraphData();
        graphData.name = this.name;
        const values: number[] = [];
        dates.forEach((date) => {
            const endDate = this.endDateSignal?.();
            if (endDate && (endDate < date)) {
                values.push(0);
            } else {
                const startDate = this.startDateSignal?.() || new Date();
                const months = Utils.monthDiff(startDate, date)
                const monthlyAmount = this.monthlyValueSignal?.() || 0;
                let total = monthlyAmount * months;
                values.push(total);
            }
        });
        if (this.subItems.length > 0) {
            this.subItems.forEach((subItem) => {
                graphData.subItemGraphData.push(subItem.valuesOnDates(dates));
            })
        }
        graphData.xAxisValues = dates;
        graphData.yAxisValues = values;
        return graphData;
    }

    constructor(name: string, startDate: Date, startValue: number) {
        this.name = name;
        startDate = startDate ? startDate : new Date();
        this.startDateSignal.set(startDate)
        startValue = startValue ? startValue : 0;
        this.startValueSignal.set(startValue)
    }

    toJson(): any {
        // console.log(this.name, this.type, this.startValueSignal())
        const json: any = {
            name: this.name,
            type: this.type,
            startValue: this.startValueSignal(),
            frequency: this.frequencySignal(),
            startDate: this.startDateSignal(),
        }
        if (this.subItems.length > 0) {
            json.subItems = [];
            this.subItems.forEach((subItem) => {
                json.subItems.push(subItem.toJson());
            })
        }
        if (this.inputs && (this.inputs.length > 0)) {
            json.inputs = this.inputs;
        }
        return json;
    }
}


