import { ref, reactive } from 'vue'
import * as chroma from 'chroma-js';

interface styleOptions {
    background: string;
}

abstract class CocosUiElement {
    onMouseup(styles: styleOptions) {

    }

    onMousedown(styles: styleOptions) {

    }

    onMouseenter(styles: styleOptions) {

    }

    onMouseleave(styles: styleOptions) {

    }
}

class TransitionColor extends CocosUiElement {
    public color = '';

    constructor(props: any) {
        super();
        this.color = this._getColor(props.color || '#4e4e4e');
    }

    _getColor(color: string) {
        switch (color) {
            case 'red':
                color = '#b54344'
                break;
            case 'green':
                color = '#6b9e51'
                break;
            case 'blue':
                color = '#4281b6';
                break;
        }
        return color;
    }

    onMouseup(styles: styleOptions) {
        styles.background = this.color;
    }

    onMousedown(styles: styleOptions): void {
        // @ts-ignore
        styles.background = chroma(this.color).darken(0.5).hex();
    }

    onMouseenter(styles: styleOptions): void {
        // @ts-ignore
        styles.background = chroma(this.color).brighten(0.3).hex();
    }

    onMouseleave(styles: styleOptions): void {
        styles.background = this.color;
    }
}

class TransitionSprite implements CocosUiElement {
    onMousedown(): void {
    }

    onMouseenter(): void {
    }

    onMouseleave(): void {
    }

    onMouseup(): void {
    }

}

export class Transition implements CocosUiElement {
    private instance: CocosUiElement | null = null;
    public theme = reactive({ background: '' });

    constructor(transition: string, props: any) {
        if (transition === 'sprite') {
            this.instance = new TransitionSprite();
        } else if (transition === 'color') {
            const instance = new TransitionColor(props);
            this.theme.background = instance.color;
            this.instance = instance;
        }
    }

    onMousedown(): void {
        this.instance?.onMousedown(this.theme);
    }

    onMouseenter(): void {
        this.instance?.onMouseenter(this.theme);
    }

    onMouseleave(): void {
        this.instance?.onMouseleave(this.theme);
    }

    onMouseup(): void {
        this.instance?.onMouseup(this.theme);
    }
}
