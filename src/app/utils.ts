import { Input } from "./models/input.model";

export class Utils {
    static monthDiff(d1: Date, d2: Date) {
        let months = 0;
        // console.log(d1, d2)
        try {
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
        } catch (error) {
            // console.error(d1)
            // console.error(d2);
            console.error(error);
        }
        return months <= 0 ? 0 : months;
    }

    static getInputValue(inputs: Input[] | undefined, name: string): number {
        const input = (inputs || []).find((input) => input.name === name);
        if (input?.value) {
            return input.value;
        }
        return 0;
    }
}