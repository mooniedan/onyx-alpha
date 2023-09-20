import { InterestItem } from "./interest-item.model";
import { ItemType } from "./item-type";

export class SavingsItem extends InterestItem {
    override type: ItemType = 'Savings';

    constructor(name: string, startDate: Date, startValue: number) {
        super(name, startDate, startValue);
        this.inputs = [
            {
                name: 'Annual interest rate',
                value: 0,
                readonly: false
            }
        ]
    }
}
