import baseSettings from './baseSettings';
import { Settings } from './';

export function getDefaultSettings(): Settings {
    return { ... baseSettings };
}
