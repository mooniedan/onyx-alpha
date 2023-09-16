import { Utils } from "../utils";
import { GoalItem } from "./goal-item.model";

export class HouseItem extends GoalItem {
    override type = 'House';

    override valueOnDate(date: Date): number {
        let dateVal = 0;
        const price = Utils.getInputValue(this.inputs, 'Price');
        const purchaseYear = Utils.getInputValue(this.inputs, 'Purchase year');
        const yearsToPurchase = Utils.getInputValue(this.inputs, 'Years to purchase');
        const depositPercentage = Utils.getInputValue(this.inputs, 'Deposit percentage');
        const interestRate = Utils.getInputValue(this.inputs, 'Interest rate') / 100;
        const mortgageTerm = Utils.getInputValue(this.inputs, 'Mortgage term');
        const numPayments = mortgageTerm * 12;
        const deposit = price * (depositPercentage / 100);
        const mortgage = price - deposit;
        const monthlyInterestRate = interestRate / 12;
        const months = Utils.monthDiff(new Date(), date);
        const monthlyPayment = mortgage * (monthlyInterestRate / (1 - (1 + monthlyInterestRate) ** (-numPayments)));
        // (mortage*monthlyInterestRate) / (1 - (1 + B6)^(-(B8)))

        const total = monthlyPayment * months;
        const purchaseDate = new Date(purchaseYear, 0, 1);
        if (date > purchaseDate) {
            dateVal = deposit + (months * monthlyPayment);
        }
        return dateVal;
    }
}
