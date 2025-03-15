// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Official Logstash plugin lists from Elastic documentation
const LOGSTASH_INPUT_PLUGINS = [
	'azure_event_hubs', 'beats', 'cloudwatch', 'couchdb_changes', 'dead_letter_queue', 'elasticsearch', 
	'exec', 'file', 'ganglia', 'gelf', 'generator', 'github', 'google_cloud_storage', 'google_pubsub', 
	'graphite', 'grpc', 'heartbeat', 'http', 'http_poller', 'imap', 'irc', 'java_generator', 'java_stdin', 
	'jdbc', 'jms', 'kafka', 'kinesis', 'log4j', 'lumberjack', 'meetup', 'pipe', 'puppet_facter', 'rabbitmq', 
	'redis', 'relp', 'rss', 's3', 'salesforce', 'snmp', 'snmptrap', 'sqs', 'stdin', 'stomp', 'syslog', 
	'tcp', 'twitter', 'udp', 'unix', 'varnishlog', 'websocket', 'wmi', 'xmpp'
];

const LOGSTASH_FILTER_PLUGINS = [
	'age', 'aggregate', 'alter', 'bytes', 'cidr', 'cipher', 'clone', 'csv', 'date', 'de_dot', 
	'dissect', 'dns', 'drop', 'elapsed', 'elastic_integration', 'elasticsearch', 'environment', 
	'extractnumbers', 'fingerprint', 'geoip', 'grok', 'http', 'i18n', 'java_uuid', 'jdbc_static', 
	'jdbc_streaming', 'json', 'json_encode', 'kv', 'memcached', 'metricize', 'metrics', 'mutate', 
	'prune', 'range', 'ruby', 'sleep', 'split', 'syslog_pri', 'threats_classifier', 'throttle', 
	'tld', 'translate', 'truncate', 'urldecode', 'useragent', 'uuid', 'wurfl_device_detection', 'xml'
];

const LOGSTASH_OUTPUT_PLUGINS = [
	'boundary', 'circonus', 'cloudwatch', 'csv', 'datadog', 'datadog_metrics', 'elastic_app_search', 
	'elasticsearch', 'email', 'file', 'ganglia', 'gelf', 'google_bigquery', 'google_cloud_storage', 
	'google_pubsub', 'graphite', 'graphtastic', 'grpc', 'http', 'influxdb', 'java_stdout', 'juggernaut', 
	'kafka', 'librato', 'loggly', 'lumberjack', 'metriccatcher', 'mongodb', 'nagios', 'nagios_nsca', 
	'opentsdb', 'pagerduty', 'pipe', 'rabbitmq', 'redis', 'redmine', 's3', 'sns', 'solr_http', 
	'sqs', 'statsd', 'stdout', 'stomp', 'syslog', 'tcp', 'timber', 'udp', 'webhdfs', 'websocket', 
	'xmpp', 'zabbix'
];

// Simple parser for Logstash configuration
function parseLogstashConfig(text: string): { 
	input: Array<{name: string, config?: string}>, 
	filter: Array<{name: string, config?: string}>, 
	output: Array<{name: string, config?: string}> 
} {
	const result = {
		input: [] as Array<{name: string, config?: string}>,
		filter: [] as Array<{name: string, config?: string}>,
		output: [] as Array<{name: string, config?: string}>
	};

	try {
		// Extract main sections
		const inputSection = extractSection(text, 'input');
		const filterSection = extractSection(text, 'filter');
		const outputSection = extractSection(text, 'output');
		
		// Process each section
		if (inputSection) {
			result.input = extractPlugins(inputSection, 'input');
		}
		
		if (filterSection) {
			result.filter = extractPlugins(filterSection, 'filter');
		}
		
		if (outputSection) {
			result.output = extractPlugins(outputSection, 'output');
		}
	} catch (error) {
		console.error('Error parsing Logstash config:', error);
	}

	return result;
}

// Extract a section (input, filter, output) from the config text
function extractSection(text: string, sectionName: string): string | null {
	const regex = new RegExp(`${sectionName}\\s*{([\\s\\S]*?)}(?=\\s*(?:input|filter|output)\\s*{|$)`, 'g');
	const match = regex.exec(text);
	return match ? match[0] : null;
}

// Extract plugins from a section
function extractPlugins(sectionText: string, sectionName: string): Array<{name: string, config?: string}> {
	const plugins: Array<{name: string, config?: string}> = [];
	const sectionNameLength = sectionName.length;
	
	// Remove the section wrapper to focus on content
	let content = sectionText.substring(sectionText.indexOf('{') + 1, sectionText.lastIndexOf('}')).trim();
	
	// Handle each plugin block
	let depth = 0;
	let currentPlugin = '';
	let pluginName = '';
	let inPlugin = false;
	let nameCapturing = false;
	
	for (let i = 0; i < content.length; i++) {
		const char = content[i];
		
		if (!inPlugin && char.match(/\S/) && !nameCapturing) {
			// Start capturing a plugin name
			nameCapturing = true;
			pluginName = char;
		} else if (nameCapturing && char !== '{' && char.match(/\S/)) {
			// Continue capturing the plugin name
			pluginName += char;
		} else if (nameCapturing && char === '{') {
			// End name capturing, start plugin content
			nameCapturing = false;
			inPlugin = true;
			depth = 1;
			currentPlugin = '{';
		} else if (inPlugin) {
			// Add character to current plugin
			currentPlugin += char;
			
			// Track nesting
			if (char === '{') {
				depth++;
			} else if (char === '}') {
				depth--;
				
				// If we've closed the plugin block
				if (depth === 0) {
					// Add the plugin to results
					const trimmedName = pluginName.trim();
					if (trimmedName !== sectionName) {
						plugins.push({
							name: trimmedName, 
							config: currentPlugin.substring(1, currentPlugin.length - 1).trim()
						});
					}
					
					// Reset for next plugin
					inPlugin = false;
					currentPlugin = '';
					pluginName = '';
				}
			}
		}
	}
	
	return plugins;
}

// Check if a plugin is officially supported
function isOfficialPlugin(pluginName: string, pluginType: 'input' | 'filter' | 'output'): boolean {
	switch(pluginType) {
		case 'input':
			return LOGSTASH_INPUT_PLUGINS.includes(pluginName);
		case 'filter':
			return LOGSTASH_FILTER_PLUGINS.includes(pluginName);
		case 'output':
			return LOGSTASH_OUTPUT_PLUGINS.includes(pluginName);
		default:
			return false;
	}
}

// Get plugin documentation URL
function getPluginDocUrl(pluginName: string, pluginType: 'input' | 'filter' | 'output'): string {
	return `https://www.elastic.co/guide/en/logstash/current/${pluginType}-plugins-${pluginName}.html`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "logstash" is now active!');

	// Track the current panel
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// Register the Visualize Pipeline command
	const visualizePipelineCommand = vscode.commands.registerCommand('logstash.visualizePipeline', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// Get the document text
		const document = editor.document;
		const text = document.getText();

		// Parse the Logstash configuration
		const pipeline = parseLogstashConfig(text);

		// Check if we already have a panel
		if (currentPanel) {
			// If we do, reveal it and update content
			currentPanel.reveal(vscode.ViewColumn.Beside);
			updateWebviewContent(currentPanel.webview, context.extensionUri, pipeline);
		} else {
			// Otherwise, create a new panel
			currentPanel = vscode.window.createWebviewPanel(
				'logstashPipelineVisualization',
				'Logstash Pipeline Visualization',
				vscode.ViewColumn.Beside,
				{
					// Enable JavaScript in the webview
					enableScripts: true,
					// Restrict access to specific resources
					localResourceRoots: [
						vscode.Uri.joinPath(context.extensionUri, 'media')
					]
				}
			);

			// Initial content
			updateWebviewContent(currentPanel.webview, context.extensionUri, pipeline);

			// Handle panel disposal
			currentPanel.onDidDispose(
				() => {
					currentPanel = undefined;
				},
				null,
				context.subscriptions
			);
		}
	});

	// Register the Validate Configuration command
	const validateConfigCommand = vscode.commands.registerCommand('logstash.validateConfig', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// Get the document text
		const document = editor.document;
		const text = document.getText();

		// Parse the Logstash configuration
		const pipeline = parseLogstashConfig(text);
		
		// Validate plugins
		const unknownPlugins: {name: string, type: string}[] = [];
		
		pipeline.input.forEach(plugin => {
			if (!isOfficialPlugin(plugin.name, 'input')) {
				unknownPlugins.push({name: plugin.name, type: 'input'});
			}
		});
		
		pipeline.filter.forEach(plugin => {
			if (!isOfficialPlugin(plugin.name, 'filter')) {
				unknownPlugins.push({name: plugin.name, type: 'filter'});
			}
		});
		
		pipeline.output.forEach(plugin => {
			if (!isOfficialPlugin(plugin.name, 'output')) {
				unknownPlugins.push({name: plugin.name, type: 'output'});
			}
		});
		
		if (unknownPlugins.length > 0) {
			const message = `Found ${unknownPlugins.length} unknown plugins: ${unknownPlugins.map(p => `${p.name} (${p.type})`).join(', ')}`;
			vscode.window.showWarningMessage(message);
		} else {
			vscode.window.showInformationMessage('Logstash configuration validated successfully. All plugins are recognized.');
		}
	});

	// Add all commands to subscriptions
	context.subscriptions.push(visualizePipelineCommand);
	context.subscriptions.push(validateConfigCommand);
}

// Update the content of the webview panel
function updateWebviewContent(
	webview: vscode.Webview,
	extensionUri: vscode.Uri,
	pipeline: { 
		input: Array<{name: string, config?: string}>, 
		filter: Array<{name: string, config?: string}>, 
		output: Array<{name: string, config?: string}> 
	}
) {
	// Get the local path to the HTML file
	const htmlPath = vscode.Uri.joinPath(extensionUri, 'media', 'pipeline-viewer.html');
	
	// Read the HTML file
	let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
	
	// Set the webview's HTML content
	webview.html = html;
	
	// Send the pipeline data to the webview with official plugin information
	const enhancedPipeline = {
		input: pipeline.input.map(plugin => ({
			...plugin,
			isOfficial: isOfficialPlugin(plugin.name, 'input'),
			docUrl: getPluginDocUrl(plugin.name, 'input')
		})),
		filter: pipeline.filter.map(plugin => ({
			...plugin,
			isOfficial: isOfficialPlugin(plugin.name, 'filter'),
			docUrl: getPluginDocUrl(plugin.name, 'filter')
		})),
		output: pipeline.output.map(plugin => ({
			...plugin,
			isOfficial: isOfficialPlugin(plugin.name, 'output'),
			docUrl: getPluginDocUrl(plugin.name, 'output')
		}))
	};
	
	webview.postMessage({ 
		type: 'setPipeline', 
		pipeline: enhancedPipeline 
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
