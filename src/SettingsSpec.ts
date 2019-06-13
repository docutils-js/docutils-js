/**
 * @rst
 * @class
 *
 * Runtime setting specification base class.
 *
 * SettingsSpec subclass objects used by `docutils.frontend.OptionParser`.
 */
class SettingsSpec {
    private settingsSpec: {}[] = [];
    private settingsDefaults?: {};
    private settingsDefaultOverrides?: {};
    private relativePathSettings: {}[] = [];
    public configSection: string = '';
    public configSectionDependencies: string[] = [];
}
export default SettingsSpec;
