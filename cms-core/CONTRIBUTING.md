# Contributing to Universal CMS Core

Thank you for your interest in contributing to Universal CMS Core! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/core.git
   cd core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the development environment**
   ```bash
   # Run the build to verify everything is working
   npm run build

   # Run tests to ensure everything passes
   npm test
   ```

### Project Structure

```
core/
├── src/                    # Source code
│   ├── __tests__/         # Test files
│   ├── builder/           # Page builder system
│   ├── components/        # Component classes
│   ├── container/         # IoC container
│   ├── interfaces/        # TypeScript interfaces
│   ├── pipeline/          # Request pipeline
│   ├── plugins/           # Plugin system
│   └── index.ts          # Main entry point
├── examples/              # Usage examples
├── .github/workflows/     # CI/CD workflows
├── dist/                  # Compiled output (generated)
├── coverage/              # Coverage reports (generated)
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## 📝 Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting. The configuration is automatically applied when you run:

```bash
npm run lint          # Check for linting issues
npm run lint:fix       # Fix linting issues automatically
```

#### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode and type checking
- Prefer explicit type annotations
- Use interfaces for object shapes
- Use enums for constants
- Document public APIs with JSDoc

```typescript
/**
 * Example component class
 */
export class ExampleComponent extends BaseComponent {
  /**
   * Renders the component
   * @param context - The render context
   * @returns Promise<RenderResult> - The render result
   */
  async render(context: RenderContext): Promise<RenderResult> {
    // Implementation
  }
}
```

### Testing

We require comprehensive tests for all new features:

```bash
npm test                 # Run all tests
npm run test:coverage   # Run tests with coverage
npm run test:watch      # Run tests in watch mode
```

#### Testing Guidelines

- Write unit tests for all new functions and classes
- Test both happy paths and error cases
- Aim for 90%+ code coverage
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;

  beforeEach(() => {
    // Arrange
    component = new ExampleComponent(mockMetadata);
  });

  describe('render', () => {
    it('should render component with correct HTML', async () => {
      // Act
      const result = await component.render(mockContext);

      // Assert
      expect(result.html).toContain('expected-content');
    });
  });
});
```

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature

   - Implemented the amazing feature
   - Added comprehensive tests
   - Updated documentation

   Closes #123"
   ```

   **Commit message format:**
   - `feat:` for new features
   - `fix:` for bug fixes
   `docs:` for documentation changes
   - `style:` for code style changes
   - `refactor:` for code refactoring
   - `test:` for test changes
   - `chore:` for maintenance changes

4. **Push and create a pull request**
   ```bash
   git push origin feature/amazing-feature
   ```

   Then create a pull request on GitHub.

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Code example** if applicable

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) if available.

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. **Check existing issues** to avoid duplicates
2. **Provide a clear description** of the feature
3. **Explain the use case** and why it's valuable
4. **Suggest implementation approach** if you have ideas

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) if available.

## 🏗️ Architecture Guidelines

### Adding New Components

1. **Extend BaseComponent**
   ```typescript
   export class NewComponent extends BaseComponent {
     async render(context: RenderContext): Promise<RenderResult> {
       // Implementation
     }
   }
   ```

2. **Implement required methods**
   - `render()`: Required - returns HTML, CSS, and JS
   - `validate()`: Optional - return validation results

3. **Add comprehensive tests**
   ```typescript
   describe('NewComponent', () => {
     // Test implementation
   });
   ```

4. **Update documentation**
   - Add to README examples
   - Update API documentation
   - Include in changelog

### Adding New Services

1. **Create service class**
   ```typescript
   export class NewService {
     constructor(dependencies?: any) {
       // Implementation
     }
   }
   ```

2. **Register in container**
   ```typescript
   container.register('NewService', NewService, ServiceLifetime.Singleton);
   ```

3. **Add TypeScript interfaces**
   ```typescript
   export interface INewService {
     // Method signatures
   }
   ```

## 📚 Documentation

### API Documentation

- Document all public APIs with JSDoc
- Include parameter types and return types
- Provide usage examples

### README Updates

- Update README.md for new features
- Add examples to the `examples/` directory
- Keep the feature list up to date

## 🧪 Quality Assurance

### Before Submitting

1. **Run all tests**: `npm test`
2. **Check linting**: `npm run lint`
3. **Build the project**: `npm run build`
4. **Test examples**: Ensure examples still work
5. **Update documentation**: Add docs for new features

### Code Review Process

- All PRs require review
- Maintain code quality standards
- Ensure test coverage is maintained
- Verify documentation is updated

## 🏆 Release Process

Releases are handled through GitHub Actions:

1. **Merge to main branch** triggers CI/CD
2. **Automatic build and test** execution
3. **Version bump** based on conventional commits
4. **Automatic NPM publishing** (if version changed)
5. **GitHub release creation**

### Version Bumping

We use semantic versioning:
- **Major (X.0.0)**: Breaking changes
- **Minor (X.Y.0)**: New features (backward compatible)
- **Patch (X.Y.Z)**: Bug fixes

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy toward other community members

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first

## 📋 Development Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (100% success rate)
- [ ] Test coverage is maintained (≥90%)
- [ ] Documentation is updated
- [ ] Examples are updated if needed
- [ ] Build completes successfully
- [ ] No console errors or warnings
- [ ] Git history is clean with meaningful commits

## 🎉 Recognition

Contributors are recognized in:

- **README.md**: Contributor list
- **Release notes**: Feature attributions
- **GitHub**: Contribution statistics

Thank you for contributing to Universal CMS Core! 🚀

---

For questions about contributing, feel free to open an issue or start a discussion.