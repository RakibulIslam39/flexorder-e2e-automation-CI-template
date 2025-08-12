#!/bin/bash

# FlexOrder CI Workflow Repository Setup Script

echo "🚀 Setting up FlexOrder CI Workflow Repository..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Check if composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "📦 Installing PHP dependencies..."
composer install

echo "🌐 Installing Playwright browsers..."
npm run install:browsers

# Create initial commit
echo "📝 Creating initial commit..."
git add .
git commit -m "Initial commit: FlexOrder CI/CD Workflow

- Complete CI/CD pipeline with WordPress integration
- Automated testing with Playwright and PHPUnit
- Security scanning with Trivy
- Code quality checks with ESLint and PHPCS
- Build automation for Free and Pro plugin versions
- Release management with GitHub Actions"

echo "✅ Initial commit created"

# Display next steps
echo ""
echo "🎉 Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo "4. Add GitHub Secrets (see README.md for details)"
echo "5. Push to trigger CI workflow:"
echo "   git push origin main"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo "🔧 For CI setup guide, see CI_SETUP.md"
echo ""
echo "🚀 Ready to deploy your FlexOrder plugin with confidence!"
