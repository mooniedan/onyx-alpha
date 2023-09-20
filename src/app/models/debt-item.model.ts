import { InterestItem } from "./interest-item.model";
import { ItemType } from "./item-type";

export class DebtItem extends InterestItem {
    override type: ItemType = 'Debt';

    constructor(name: string, startDate: Date, startValue: number) {
        super(name, startDate, startValue);
        this.inputs = [
            {
                name: 'Annual interest rate',
                value: 0,
                readonly: false
            },
            {
                name: 'Monthly payment amount',
                value: 0,
                readonly: false
            }
        ]
    }
}
