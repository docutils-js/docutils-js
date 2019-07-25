/**
 * @rst
 * @class
 *
 * Runtime setting specification base class.
 *
 * SettingsSpec subclass objects used by `docutils.frontend.OptionParser`.
 */
 import { SettingsSpecType } from './types';
class SettingsSpec {
    public settingsSpec: SettingsSpecType[] = [];
    public settingsDefaults?: {};
    public settingsDefaultOverrides?: {};
    public relativePathSettings: string[] = [];
    public configSection: string = '';
    public configSectionDependencies: string[] = [];
}
export default SettingsSpec;
