# Contributing to QuickCommerce

Thank you for your interest in contributing to QuickCommerce! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Bug Reports](#bug-reports)
8. [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Git
- Basic knowledge of JavaScript, React Native, and Node.js

### Setup Development Environment

1. **Fork the Repository**
```bash
# Click "Fork" on GitHub
```

2. **Clone Your Fork**
```bash
git clone https://github.com/YOUR_USERNAME/quickcommerce-exporeactnative.git
cd quickcommerce-exporeactnative
```

3. **Add Upstream Remote**
```bash
git remote add upstream https://github.com/workitsraj/quickcommerce-exporeactnative.git
```

4. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run dev
```

5. **Setup Mobile App**
```bash
cd mobile
npm install
npm start
```

### Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
npm test

# Lint code
npm run lint

# Mobile app
cd mobile
npm test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add user authentication"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Fill in the PR template
- Wait for review

## Coding Standards

### JavaScript/Node.js

#### Style Guide

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use template literals for string interpolation
- Use destructuring when beneficial
- Keep functions small and focused (single responsibility)

#### Example

```javascript
// Good
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

// Avoid
var getUserById = function(userId) {
  return User.findById(userId).then(function(user) {
    return user;
  });
};
```

#### Naming Conventions

- **Variables & Functions**: camelCase (`getUserProfile`, `isActive`)
- **Classes**: PascalCase (`UserController`, `AuthService`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Files**: camelCase for utilities, PascalCase for components

#### Code Organization

```javascript
// 1. External imports
const express = require('express');
const mongoose = require('mongoose');

// 2. Internal imports
const User = require('./models/User');
const authMiddleware = require('./middleware/auth');

// 3. Constants
const PORT = 5000;

// 4. Function definitions
const startServer = () => {
  // ...
};

// 5. Exports
module.exports = { startServer };
```

### React Native

#### Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyComponent = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Handlers
  const handlePress = () => {
    // ...
  };
  
  // 4. Render
  return (
    <View style={styles.container}>
      <Text>{prop1}</Text>
    </View>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MyComponent;
```

#### Styling

- Use StyleSheet.create for styles
- Keep styles at the bottom of the file
- Use meaningful style names
- Extract common styles to constants

### API Design

#### RESTful Conventions

```javascript
// Good
GET    /api/users          // List users
GET    /api/users/:id      // Get user
POST   /api/users          // Create user
PUT    /api/users/:id      // Update user
DELETE /api/users/:id      // Delete user

// Avoid
GET    /api/getUsers
POST   /api/createUser
```

#### Response Format

```javascript
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional
}
```

#### Error Handling

```javascript
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.status(200).json({
    success: true,
    data: user
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: error.message
  });
}
```

### Database

#### Schema Design

```javascript
const userSchema = new mongoose.Schema({
  // Required fields first
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  // Optional fields
  bio: String,
  // Nested objects
  settings: {
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true  // Adds createdAt, updatedAt
});
```

#### Indexes

```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Examples

```bash
feat(auth): add JWT refresh token functionality

Implement refresh token endpoint to allow users to get new access tokens
without re-authenticating.

Closes #123
```

```bash
fix(profile): resolve image upload issue

Fixed bug where profile pictures weren't uploading to S3 correctly.
Added proper error handling and validation.

Fixes #456
```

## Pull Request Process

### Before Creating PR

1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ Documentation updated
4. ✅ Commit messages follow guidelines
5. ✅ Branch is up to date with main
6. ✅ No merge conflicts

### PR Title Format

```
[Type] Brief description

Examples:
[Feature] Add social login support
[Fix] Resolve token refresh issue
[Docs] Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. Maintainer reviews code
2. Automated tests run
3. Changes requested (if needed)
4. Approval given
5. PR merged

### After Merge

- Delete your branch
- Update your fork
- Close related issues

## Bug Reports

### Before Submitting

1. Check existing issues
2. Try latest version
3. Collect relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.0.0]
- App version: [e.g., 1.0.0]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## Questions?

- Open an issue for questions
- Join our community discussions
- Check existing documentation

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in project updates

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to QuickCommerce! 🚀
