import { Buffer } from 'buffer';
import crypto from 'crypto';
export function md5Data(data: ArrayBuffer | string): string {
    const hash = crypto.createHash('md5');
    if (typeof data === 'string') {
        hash.update(data);
    } else if (data instanceof ArrayBuffer) {
        hash.update(Buffer.from(data));
    }
    const key = hash.digest('hex');
    return key;
}
