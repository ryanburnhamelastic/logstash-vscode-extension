# Change Log

All notable changes to the "logstash" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.1] - 2025-03-15

### Added
- Syntax highlighting for Logstash configuration files
- Language configuration for .conf, .config, and .logstash file extensions
- Interactive pipeline visualization feature
  - Visual representation of input, filter, and output pipeline sections
  - Filter sequence visualization showing processing order
  - Configuration inspection for each plugin
  - Plugin categorization with official/custom status badges
  - Documentation links for all official plugins
- Comprehensive plugin support
  - Support for all 46+ official Logstash filter plugins
  - Support for 50+ official input and output plugins
  - Direct links to official Elastic documentation
- Configuration validation
  - Validation of plugins against official Elastic documentation
  - Error detection for unknown or custom plugins
- Example configurations for testing and reference

### Fixed
- Improved parser to handle complex configurations with conditionals
- Fixed nested braces parsing in filter sections
- Enhanced pipeline visualization rendering

### Technical Improvements
- Character-by-character parser for accurate config processing
- WebView-based visualization with VS Code theme integration
- Plugin status indicators (official vs. custom)
- Collapsible configuration sections