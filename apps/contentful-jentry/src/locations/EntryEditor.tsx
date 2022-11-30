import { EditorExtensionSDK, EntryFieldAPI } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import React, { ReactElement } from 'react';

import FieldEditor from '../components/FieldEditor';
import FieldValue from '../components/FieldValue';

interface fieldValues {
	[index: string]: any;
}

const sha256 = async (message: object): Promise<string> => {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(JSON.stringify(message));
	// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	// convert bytes to hex string
	const hashHex = hashArray
		.map((b) => ('00' + b.toString(16)).slice(-2))
		.join('');
	return hashHex;
};

const Entry = (): ReactElement => {
	const [editingFieldId, setEditingFieldID] = React.useState('');
	const [editingLocale, setEditingLocale] = React.useState('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [fieldsHash, setFieldsHash] = React.useState({});
	const sdk = useSDK<EditorExtensionSDK>();
	const fields = sdk.entry.fields;
	const localFieldValues: fieldValues = {};
	const spaceLocales: string[] = [sdk.locales.default];
	Object.keys(sdk.locales.names).forEach((localeKey) => {
		if (localeKey !== sdk.locales.default) {
			spaceLocales.push(localeKey);
		}
	});

	const setFieldsHashInState = async (): Promise<void> => {
		Object.keys(fields).forEach((fieldKey) => {
			spaceLocales.forEach((localeKey) => {
				try {
					const localValue = fields[fieldKey].getValue(localeKey);
					localFieldValues[fieldKey + ':' + localeKey] = localValue;
				} catch {}
			});
		});
		setFieldsHash(await sha256(localFieldValues));
	};

	const handleValueChange = (): void => {
		setFieldsHashInState().catch((e) =>
			console.error('setFieldsHashInState error:', e)
		);
	};
	// Reload the custom editor when a field is changed in the standard editor
	Object.keys(fields).forEach((key) => {
		fields[key].onValueChanged(() => handleValueChange());
	});

	const editField = (fieldId: string, locale: string): null => {
		setEditingFieldID(fieldId);
		setEditingLocale(locale);
		return null;
	};
	const saveField = async (
		newValue: any,
		field: EntryFieldAPI
	): Promise<void> => {
		let objValue: any;
		try {
			objValue = JSON.parse(newValue);
			await field
				.setValue(objValue)
				.then((e) =>
					sdk.notifier.success(
						'Field value updated. Please wait for the entry to auto-save.'
					)
				)
				.catch((e) => sdk.notifier.error(e));
			setEditingFieldID('');
		} catch {
			sdk.notifier.error('JSON is not valid');
		}
	};
	return (
		<>
			{!editingFieldId && (
				<>
					<table>
						<tbody>
							<tr>
								<th>Field test</th>
								{spaceLocales.map((key) => {
									return (
										<th key={'locale-' + key}>
											{sdk.locales.names[key]} ({key})
										</th>
									);
								})}
							</tr>
							{Object.keys(fields).map((key, i) => {
								const field = fields[key];
								const isEven = i % 2 === 0 ? 'even' : '';
								try {
									return (
										<tr key={'field-' + key}>
											<td className={`${isEven} fieldId`}>{field.id}</td>
											{spaceLocales.map((locale) => {
												const value = field.locales.includes(locale)
													? field.getValue(locale)
													: null;
												return (
													<td className={isEven} key={'value-' + locale}>
														{value && (
															<FieldValue
																sdk={sdk}
																value={value}
																editField={() => editField(field.id, locale)}
															></FieldValue>
														)}
													</td>
												);
											})}
										</tr>
									);
								} catch (e) {
									console.log(e);
									return null;
								}
							})}
						</tbody>
					</table>
					<h2>Entry Sys</h2>
					<div className="entrySys">
						<pre>{JSON.stringify(sdk.entry.getSys(), undefined, '  ')}</pre>
					</div>
				</>
			)}
			{editingFieldId && (
				<FieldEditor
					locale={editingLocale}
					field={fields[editingFieldId]}
					cancelFunc={() => {
						setEditingFieldID('');
					}}
					saveFunc={(newValue: string) => {
						saveField(newValue, fields[editingFieldId]).catch((e) => {
							console.error('Save Field error', e);
						});
					}}
				/>
			)}
		</>
	);
};

export default Entry;
