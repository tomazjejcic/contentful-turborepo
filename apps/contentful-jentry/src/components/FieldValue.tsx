import { EditorExtensionSDK } from '@contentful/app-sdk';
import React, { ReactElement } from 'react';

export interface FieldValueProps {
	value: any;
	editField: () => any;
	sdk: EditorExtensionSDK;
}

const FieldValue = (props: FieldValueProps): ReactElement => {
	const [showCommands, setShowCommands] = React.useState(false);
	let stringValue: any = <em>(Empty value)</em>;
	const isObject = typeof props.value === 'object';
	if (isObject) {
		stringValue = JSON.stringify(props.value, undefined, '  ');
	} else {
		stringValue = props.value ? props.value : <em>(Empty value)</em>;
	}

	const handleOnClick = (): void => {
		navigator.clipboard
			.writeText(stringValue)
			.then(() => {
				props.sdk.notifier.success('Payload copied to clipboard');
			})
			.catch((e) => {
				console.log('clipboard error:', e);
				props.sdk.notifier.error(e);
			});
	};

	return (
		<pre
			className="fieldValue"
			onMouseEnter={() => setShowCommands(true)}
			onMouseLeave={() => setShowCommands(false)}
		>
			{showCommands && isObject && (
				<div className="fieldValueTools">
					<a className="button" onClick={() => handleOnClick()}>
						Copy
					</a>
					<a className="button" onClick={props.editField}>
						Edit
					</a>
				</div>
			)}
			{stringValue}
		</pre>
	);
};

export default FieldValue;
