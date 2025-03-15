# Logstash Pipeline Builder for VS Code

This extension transforms Visual Studio Code into a powerful Logstash configuration editor, enhancing productivity when creating and maintaining Logstash pipelines.

![Logstash Pipeline Builder](https://raw.githubusercontent.com/elastic/example-images/main/logstash-logo.png)

## What is Logstash?

[Logstash](https://www.elastic.co/logstash/) is an open-source data processing pipeline that ingests, transforms, and sends data to various destinations. It's a core component of the Elastic Stack (ELK) used for log management, metrics collection, and data enrichment.

## Extension Features

### Syntax Highlighting
- Clear syntax coloring for Logstash configuration files
- Visual differentiation between sections, plugins, strings, and operators
- Easier identification of configuration structure and components

### Intelligent Auto-completion
- Context-aware suggestions based on your current position in the configuration
- Main section completion (input, filter, output)
- Plugin completion within each section:
  - **Input plugins**: file, beats, tcp, udp, etc.
  - **Filter plugins**: grok, mutate, date, json, etc.
  - **Output plugins**: elasticsearch, stdout, file, etc.

### Interactive Documentation
- Hover over Logstash keywords to view inline documentation
- Quick reference information without leaving your editor
- Helps both beginners and experts understand configuration options

### Pipeline Visualization (Coming Soon)
- Visual representation of your Logstash pipeline
- Drag-and-drop interface for pipeline components
- Flow visualization from inputs through filters to outputs

### Configuration Validation (Coming Soon)
- Real-time validation of your Logstash configuration
- Error detection and prevention
- Best practice suggestions

## Installation

### From VS Code Marketplace (Coming Soon)
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Logstash Pipeline Builder"
4. Click "Install"

### Manual Installation
1. Download the `.vsix` file from [GitHub Releases](https://github.com/yourusername/logstash-vscode/releases)
2. In VS Code, go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Click the "..." menu at the top of the Extensions view
4. Select "Install from VSIX..."
5. Choose the downloaded .vsix file

## Usage Guide

### Creating a New Logstash Configuration File
1. Open VS Code
2. Create a new file with a `.conf` extension (e.g., `pipeline.conf`)
3. Start typing to see auto-completions and suggestions

### Working with Existing Configurations
1. Open any `.conf` file containing Logstash configuration
2. The extension will automatically activate
3. Navigate through your configuration with enhanced syntax highlighting

### Using Auto-completion
1. Begin typing in an empty file to see section suggestions (input, filter, output)
2. Inside a section block, press Ctrl+Space to trigger plugin suggestions
3. The extension intelligently suggests appropriate plugins for each section

### Example: Building a Basic Pipeline
```
input {
    file {
        path => "/var/log/system.log"
        start_position => "beginning"
    }
}

filter {
    grok {
        match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
        match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
}

output {
    elasticsearch {
        hosts => ["localhost:9200"]
        index => "system-%{+YYYY.MM.dd}"
    }
    stdout { codec => rubydebug }
}
```

### Using Commands
1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "Logstash" to see available commands:
   - "Logstash: Visualize Pipeline" (coming soon)
   - "Logstash: Validate Configuration" (coming soon)

## Keyboard Shortcuts
- `Ctrl+Space` (Windows/Linux) or `Cmd+Space` (macOS): Trigger suggestions
- `Hover` over keywords for documentation

## Extension Settings
This extension contributes the following settings (coming soon):
* `logstash.validation.enabled`: Enable/disable configuration validation
* `logstash.visualization.autoUpdate`: Automatically update visualization on changes

## Development

### Building from Source
1. Clone the repository
   ```
   git clone https://github.com/yourusername/logstash-vscode.git
   ```
2. Install dependencies
   ```
   cd logstash-vscode/logstash
   npm install
   ```
3. Build the extension
   ```
   npm run compile
   ```
4. Package the extension
   ```
   vsce package
   ```

### Running Tests
```
npm test
```

## Future Plans
- Pipeline visualization with interactive diagram
- Real-time configuration validation
- Snippets for common patterns
- Integration with Elastic Cloud
- Support for conditional statements and expressions
- Performance analysis suggestions

## Support

If you encounter any issues or have feature suggestions, please open an issue on the [GitHub repository](https://github.com/yourusername/logstash-vscode/issues).

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy building your Logstash pipelines!**
