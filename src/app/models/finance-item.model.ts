import { WritableSignal, Signal, signal, computed, effect } from "@angular/core";
import { Input } from "./input.model";
import { Utils } from "../utils";
import { Frequency } from "./frequency";

export class FinanceItem {
    name: string;
    type: string = 'FinanceItem';
    readonly startValueSignal = signal(0);
    readonly startDateSignal = signal(new Date());
    endDateSignal?: WritableSignal<Date> | undefined;
    subItems: FinanceItem[] = [];
    inputs?: Input[];
    frequencySignal: WritableSignal<Frequency> = signal('month');

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
            case '4 weeks': return startValue * 12 / 52;
            case '2 weeks': return startValue * 12 / 26;
            case 'week': return startValue * 12 / 52;
            case 'day': return startValue * 12 / 365;
            case 'month':
            default: return startValue;
        }
    })

    totalMonthlyValueSignal = computed(() => {
        if (this.subItems.length > 0) {
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

    valueOnDate(date: Date): number {
        const endDate = this.endDateSignal?.();
        // console.warn(endDate);
        if (endDate && (endDate < date)) {
            return 0;
        }
        const startDate = this.startDateSignal?.() || new Date();
        const months = Utils.monthDiff(startDate, date)
        // console.log(this.startDateSignal())
        // console.log(date),
        // console.log(months);
        const monthlyAmount = this.monthlyValueSignal?.() || 0;
        // console.log(this.name, this.type, months, startValue);
        let total = monthlyAmount * months;
        if (this.subItems.length > 0) {
            this.subItems.forEach((subItem) => {
                // console.log(this.name, subItem.name, subItem.type, subItem.valueOnDate(date), subItem);
                total += Number(subItem.valueOnDate(date));
            })
            return total
        }
        // console.warn('FinanceItem', this.name, total);
        return total;
    }

    constructor(name: string, startDate: Date, startValue: number) {
        // console.error('constructor', name, startDate, startValue);
        this.name = name;
        startDate = startDate ? startDate : new Date();
        this.startDateSignal.set(startDate)
        startValue = startValue ? startValue : 0;
        this.startValueSignal.set(startValue)
        // console.warn('constructor', name, startDate, startValue);

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
        if (this.inputs && (this.inputs.length > 0)){
            json.inputs = this.inputs;
        }
        return json;
    }
}


