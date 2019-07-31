import {Action,ArgumentOptions, ArgumentParser, Namespace,ActionConstructorOptions} from 'argparse';
// @ts-ignore
import { ActionContainer } from 'argparse/lib/action_container';

export class ActionValidating extends Action {
    protected options: ActionConstructorOptions & { delegatedAction?: string; validator: (parser: ArgumentParser, namespace: Namespace, values: any[]) => any };
    protected delegatedAction?: string;
    protected validator: (parser: ArgumentParser, namespace: Namespace, values: any[],
        optionString: (string|null)) => any;
    public constructor(options: ActionConstructorOptions & { delegatedAction?: string; validator: (parser: ArgumentParser, namespace: Namespace, values: any[]) => any }) {
        super(options);
        this.options = options;
        this.delegatedAction = options.delegatedAction;
        this.validator = options.validator;
    }

    public call(parser: ArgumentParser, namespace: Namespace, values: any[],
        optionString: (string|null)): void {
        // @ts-ignore
        const Action = parser._registryGet('action', this.delegatedAction);
        if(Action === undefined) {
            throw new Error(`no action for ${this.delegatedAction}`);
        }
        const value = this.validator(parser, namespace, values, optionString);
        const action = new Action(Object.assign({}, this.options, { "constant": value }));
        action.call(parser, namespace, [value], optionString);
    }
}


