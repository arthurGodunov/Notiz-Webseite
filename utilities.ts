export const utils = {
    $: function <T extends Element | NodeList>(selector: string, type?: { new(): T }): T {
        const el = document.querySelector(selector);
        if (!el) throw new Error('Wrong selector: ' + selector);

        if (type && !(el instanceof type)) {
            throw new Error(`Element is not of expected type: ${selector}`);
        }

        return el as T;
    },
    shortify: function (str: string, length: number) {
        return str.slice(0, length) + '...';
    },
    clamp: function (value: number, min: number, max: number) {
        if (value < min) value = min;
        if (value > max) value = max;
        return value;
    },
    encode: function (str: string, TKv: number, symbolArray: string[]) {
        const result: string[] = [];

        for (const char of str) {

            const index = symbolArray.indexOf(char);

            if (index !== -1) {
                result.push('A' + (index + TKv).toString(36) + '\x1D');
            }

            else if (!isNaN(Number(char)) && char !== ' ') {
                result.push('N' + (Number(char) + TKv).toString(36) + '\x1D');
            }

            else {
                result.push('U' + (char.codePointAt(0)! + TKv).toString(36) + '\x1D');
            }
        }

        return result.join('');
    },
    decode: function (str: string, TKv: number, symbolArray: string[]) {
        const parts = str.split('\x1D').filter(Boolean);
        const result: string[] = [];
        const len = symbolArray.length;

        for (const part of parts) {

            if (part.startsWith('A')) {
                const value = part.slice(1);

                const index =
                    (parseInt(value, 36) - TKv + len) % len;

                result.push(symbolArray[index]);
            }

            else if (part.startsWith('N')) {
                const value = part.slice(1);

                const num = (parseInt(value, 36) - TKv) % len;

                result.push(String(num));
            }

            else if (part.startsWith('U')) {
                const value = part.slice(1);

                const uniCode = parseInt(value, 36) - TKv;

                result.push(String.fromCodePoint(uniCode));
            }
        }

        return result.join('');
    },
    sleep: async function (ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
};
