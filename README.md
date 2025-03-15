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

### Comprehensive Plugin Support
- Full support for all official Elastic Logstash plugins:
  - 50+ input plugins
  - 46+ filter plugins 
  - 50+ output plugins
- Plugin validation against the official Elastic documentation
- Identification of custom vs. official plugins

### Interactive Documentation
- Direct links to official Elastic documentation for each plugin
- Hover over Logstash keywords to view inline documentation
- Quick reference information without leaving your editor

### Advanced Pipeline Visualization
- Detailed visual representation of your Logstash pipeline
- Interactive diagram showing data flow from inputs through filters to outputs
- Filter sequence visualization displaying the exact order of processing
- Plugin configuration inspection
- Plugin categorization with official/custom status badges
- Accessible via command palette: "Logstash: Visualize Pipeline"

### Configuration Validation
- Validation of plugins against official Elastic documentation
- Error detection for unknown or unsupported plugins
- Access via "Logstash: Validate Configuration" command

## Installation

### From VS Code Marketplace (Coming Soon)
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Logstash Pipeline Builder"
4. Click "Install"

### Manual Installation
1. Download the `.vsix` file from [GitHub Releases](https://github.com/ryanburnhamelastic/logstash-vscode/releases)
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

### Visualizing Your Pipeline
1. Open a Logstash configuration file
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Type "Logstash: Visualize Pipeline" and press Enter
4. A visualization panel will open showing your pipeline structure
5. The visualization includes:
   - Input, filter, and output sections with plugin counts
   - Filter sequence diagram showing processing order
   - Detailed configuration for each plugin (click "Configuration" to expand)
   - Documentation links for official plugins
   - Official/custom plugin badges

### Validating Your Configuration
1. Open a Logstash configuration file
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Type "Logstash: Validate Configuration" and press Enter
4. The extension will check all plugins against the official Elastic documentation
5. You'll receive notifications about any unknown or custom plugins

### Example: Building a Complex Pipeline
```
input {
  file {
    path => "/var/log/apache2/access.log"
    start_position => "beginning"
    tags => ["apache"]
  }
  
  beats {
    port => 5044
    host => "0.0.0.0"
    ssl => false
    tags => ["filebeat"]
  }
}

filter {
  # Parse logs with different patterns based on source
  if "apache" in [tags] {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  } else if "filebeat" in [tags] {
    grok {
      match => { "message" => "%{SYSLOGLINE}" }
    }
  }

  # Add timestamp
  date {
    match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    target => "@timestamp"
  }

  # Add geoip information based on client IP
  geoip {
    source => "clientip"
    target => "geo"
  }

  # UUID for each event
  uuid {
    target => "event_id"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
  
  stdout { codec => rubydebug }
}
```

### Using Commands
1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "Logstash" to see available commands:
   - "Logstash: Visualize Pipeline" - View a visual representation of your pipeline
   - "Logstash: Validate Configuration" - Check plugins against official documentation

## Keyboard Shortcuts
- `Ctrl+Space` (Windows/Linux) or `Cmd+Space` (macOS): Trigger suggestions
- `Hover` over keywords for documentation

## Supported Plugins

This extension supports all the official Logstash plugins from the Elastic documentation:

### Filter Plugins
The extension supports all 46+ official filter plugins from Elastic, including:
- grok, mutate, date, json, csv 
- geoip, cidr, dns
- ruby, http
- kv, dissect
- drop, clone, translate
- useragent, fingerprint, uuid
- throttle, sleep, truncate
- ...and many more!

Visit the [Elastic Filter Plugins Documentation](https://www.elastic.co/guide/en/logstash/current/filter-plugins.html) for a complete list.

## Development

### Building from Source
1. Clone the repository
   ```
   git clone https://github.com/ryanburnhamelastic/logstash-vscode.git
   ```
2. Install dependencies
   ```
   cd logstash-vscode/logstash
   npm install
   ```
3. Build the extension
   ```
   npm run esbuild
   ```
4. Package the extension
   ```
   vsce package
   ```

## Future Plans
- Drag-and-drop pipeline editing
- Snippets for common patterns
- Integration with Elastic Cloud
- Support for complex conditional statements visualization
- Performance analysis suggestions

## Support

If you encounter any issues or have feature suggestions, please open an issue on the [GitHub repository](https://github.com/ryanburnhamelastic/logstash-vscode/issues).

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy building your Logstash pipelines!** 