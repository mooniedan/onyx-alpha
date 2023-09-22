import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(array: any[], property: string, order: 'asc' | 'desc'): any[] {
    if (!Array.isArray(array) || !property) {
      return array;
    }

    array.sort((a, b) => {
      const idA = a[property];
      const idB = b[property];

      if (order === 'asc') {
        return idA - idB;
      } else {
        return idB - idA;
      }
    });

    return array;
  }

}
