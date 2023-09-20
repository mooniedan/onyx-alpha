import { WritableSignal, Signal, signal, computed } from "@angular/core";
import { Input } from "./input.model";
import { FinanceItem } from "./finance-item.model";
import { Utils } from "../utils";
import { GraphData } from "./graph-data.model";
import { ItemType } from "./item-type";

export class InterestItem extends FinanceItem {
    // interestRateSignal = signal(0.15);
    override type: ItemType = 'Default';

    constructor(name: string, startDate: Date, startValue: number) {
        super(name, startDate, startValue);
        // console.warn(this.name);
        // console.warn(this.startValueSignal());
    }

    override valuesOnDates(dates: Date[]): GraphData {
        const graphData = new GraphData();
        graphData.name = this.name;
        const values: number[] = [];
        const startDate = this.startDateSignal() ? this.startDateSignal() : new Date();
        const startValue = this.startValueSignal() ? this.startValueSignal() : 0;
        // console.log(this.name, this.type, months, startValue);
        let interestRate = 0;
        const interestRateInput = this.inputs?.find((input) => input.name === 'Annual interest rate');
        if (interestRateInput?.value) {
            interestRate = interestRateInput.value;
            interestRate = interestRate / 100;
        }
        let monthlyPayment = this.inputs?.find((input) => input.name === 'Monthly payment amount');
        dates.forEach((date) => {

            const months = Utils.monthDiff(startDate, date)
            // if (values.length > 0) {
            //     const lastValue = values[values.length - 1];
            //     if (lastValue === 0) {
            //         // console.log(this.name, 'skipping', values, date)
            //         values.push(0);
            //         return;
            //     }
            // }
            const payoffPeriods = -this.NPER(interestRate / 12, monthlyPayment?.value || 0, startValue, 0, 0);
            // console.log(payoffPeriods, months)
            if (payoffPeriods < months) {
                values.push(0);
                return;
            }

            let totalMonthlyPayments = 0;
            if (monthlyPayment?.value) {
                totalMonthlyPayments = monthlyPayment.value * months;
            }

            // console.warn(startValue, interestRate, months, totalMonthlyPayments)
            const totalBalance = (startValue * (1 + (interestRate / 12)) ** (months));
            let total = totalBalance - totalMonthlyPayments;
            if (total <= 0) {
                total = 0;
            }
            // console.log(monthlyPayment?.value, Math.floor(totalBalance), Math.floor(totalMonthlyPayments), Math.floor(total));
            // console.log(startValue);

            // console.warn('Interest Item', this.name, this.subItems.length, total);
            values.push(total);
        });
        if (this.subItems.length > 0) {
            this.subItems.forEach((subItem) => {
                graphData.subItemGraphData.push(subItem.valuesOnDates(dates));
            })
        }
        graphData.xAxisValues = dates;
        graphData.yAxisValues = values;
        return graphData
    }

    NPER(rate: number, payment: number, present: number, future: number, type: number) {
        // Initialize type
        type = (typeof type === 'undefined') ? 0 : type;

        // Initialize future value
        future = (typeof future === 'undefined') ? 0 : future;

        // Return number of periods
        const num = payment * (1 + rate * type) - future * rate;
        const den = (present * rate + payment * (1 + rate * type));
        return Math.log(num / den) / Math.log(1 + rate);
    }

    override subItemsValueOnDate(date: Date): number {
        return 0
    }
}
