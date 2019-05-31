import Publisher from './Publisher';

class CustomPublisher extends Publisher {
    publish(args, cb) {
        const {
 argv, usage, description, settingsSpec,
            settingsOverrides, configSection,
            enableExitStatus, // eslint-disable-line no-unused-vars
} = args;
        try {
            if (this.settings === undefined) {
                this.processCommandLine({
 argv, usage, description, settingsSpec, configSection, settingsOverrides,
});
            }
            this.setIO();


            this.reader.read(
                this.source, this.parser, this.settings,
                ((error, document) => {
                    if (error) {
                        cb(error, undefined);
                        return;
                    }
                    this.document = document;
                    if (!document) {
                        throw new Error('need document');
                    }
                    this.applyTransforms();
                    const output = this.writer.write(this.document, this.destination);
                    this.writer.assembleParts();
                    cb(undefined, output);
                }),
);
        } catch (error) {
            cb(error, undefined);
        }
    }
}
export default CustomPublisher;
