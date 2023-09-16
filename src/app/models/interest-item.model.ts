import { WritableSignal, Signal, signal, computed } from "@angular/core";
import { Input } from "./input.model";
import { FinanceItem } from "./finance-item.model";
import { Utils } from "../utils";

export class InterestItem extends FinanceItem {
    // interestRateSignal = signal(0.15);
    override type = 'Interest';

    constructor(name: string, startDate: Date, startValue: number) {
        super(name, startDate, startValue);
        // console.warn(this.name);
        // console.warn(this.startValueSignal());
    }

    override valueOnDate(date: Date): number {
        const startDate = this.startDateSignal() ? this.startDateSignal() : new Date();
        const months = Utils.monthDiff(startDate, date)
        const startValue = this.startValueSignal() ? this.startValueSignal() : 0;
        // console.log(this.name, this.type, months, startValue);
        let interestRate = 0;
        const interestRateInput = this.inputs?.find((input) => input.name === 'Interest rate');
        if (interestRateInput?.value) {
            interestRate = interestRateInput.value;
            interestRate = interestRate / 100;
        }
        let total = startValue * (1 + (interestRate / 12)) ** (months);
        // console.log(startValue);
        if (this.subItems.length > 0) {
            this.subItems.forEach((subItem) => {
                // console.log(this.name, subItem.name, subItem.type, subItem.startValueSignal(), subItem.valueOnDate(date), subItem);
                total += Number(subItem.valueOnDate(date));
                // console.warn(total);
            })
        }
        // console.warn('Interest Item', this.name, this.subItems.length, total);
        return total;
    }

    override subItemsValueOnDate(date: Date): number {
        return 0
    }
}
