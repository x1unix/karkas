/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Currency filter
 *
 * @package karkas.filters.currency
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

export function currencyFilter($value: string, $currency: string = '$', $digitsToFixed: any) {
    // Currency by default is USD
    $currency = $currency || "$";


    function formatMoney(n: any, c: number, d?: string, t?: string){
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i: any = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j: number = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    return $currency + " " + formatMoney($value, $digitsToFixed);


};
