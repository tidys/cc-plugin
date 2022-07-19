// @ts-ignore
import tinycolor from 'tinycolor2';

import {TinyEmitter} from 'tiny-emitter';

export const Emitter = new TinyEmitter();
export const EmitterMsg = {
    UpdateColor: 'UpdateColor',
};

export function transformColorWithHSL(colorStr: string, hue: number): string {
    const old = tinycolor(colorStr)
        .toHsv();
    const hsl = tinycolor()
        .toHsv();
    hsl.h = hue;
    hsl.s = old.s;
    hsl.v = old.v;
    const newColor = tinycolor(hsl);
    return newColor.toHex8();
}

export function getColorHue(str: string): number {
    return tinycolor(str)
        .toHsv().h;
}
export function createColorByHue(hue:number) {
    const hsv = tinycolor().toHsv();
    hsv.h = hue;
    hsv.s = 1;
    hsv.v = 1;
    return tinycolor(hsv).toHex();
}
export function getColorHSV(str: string) {
    return tinycolor(str)
        .toHsv();
}

export function transformColorWithAlpha(colorStr: string, alpha: number) {
    const color = tinycolor(colorStr);
    const hsl = color.toHsl();
    hsl.a = alpha;
    const newColor = tinycolor(hsl);
    return newColor.toHex8();
}

export function transformColorWithHSV(colorStr: string, saturation: number, bright: number) {
    const color = tinycolor(colorStr);
    const hsvaColor = color.toHsv();
    hsvaColor.s = saturation;
    hsvaColor.v = bright;
    return tinycolor(hsvaColor)
        .toHex8();
}

export function getColorHex(colorStr: string): string {
    const color = tinycolor(colorStr);
    return color.toHex();
}

export function getColorHex8(colorStr: string) {
    const color = tinycolor(colorStr);
    return color.toHex8();
}

export function checkColor(str: string) {
    const color = tinycolor(str);
    if (color.isValid()) {
        return color.toHex8();
    } else {
        return null;
    }
}