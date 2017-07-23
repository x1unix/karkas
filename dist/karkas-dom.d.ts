/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
import { Karkas } from './karkas';
export declare class KarkasDOM extends Karkas {
    constructor();
    onFind(): void;
    private compileElement(element);
    refresh(refreshItems: boolean): boolean;
    include(url: string, templateName: string, successCallback?: Function): Promise<string> | void;
}
