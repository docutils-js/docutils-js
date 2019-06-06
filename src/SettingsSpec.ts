/**
 * @rst
 * @class
 *
 * Runtime setting specification base class.
 *
 * SettingsSpec subclass objects used by `docutils.frontend.OptionParser`.
 */
class SettingsSpec {
    private settingsSpec: any[];
    private settingsDefaults: any;
    private settingsDefaultOverrides: any;
    private relativePathSettings: any[];
    public configSection: string;
    public configSectionDependencies: string[];
    /* eslint-disable-next-line no-unused-vars */
    _init(...args) {
        this.settingsSpec = [];
        this.settingsDefaults = null;
        this.settingsDefaultOverrides = null;
        this.relativePathSettings = [];
        this.configSection = null;
        this.configSectionDependencies = null;
    }
}
export default SettingsSpec;
