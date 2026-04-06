#!/bin/bash

echo "🚀 Setting up AI CDSS BHYT development environment..."

# Set up Node.js dependencies
echo "📦 Installing Node dependencies..."
npm install --legacy-peer-deps

# Set up Python virtual environment
echo "🐍 Setting up Python environment..."
python -m venv /workspaces/ung_dung_cdss_bhyt/venv
source /workspaces/ung_dung_cdss_bhyt/venv/bin/activate

pip install --upgrade pip
pip install -r python_service/requirements.txt

# Install development dependenencies
echo "🛠️ Installing dev dependencies..."
pip install pytest pytest-cov pylint black flake8 pre-commit

# Setup pre-commit hooks
echo "🔧 Setting up Git hooks..."
pip install pre-commit
pre-commit install || true

# Create .env if not exists
if [ ! -f /workspaces/ung_dung_cdss_bhyt/.env ]; then
  echo "📝 Creating .env file..."
  cat > /workspaces/ung_dung_cdss_bhyt/.env << 'EOF'
# Development environment
NODE_ENV=development
PYTHON_ENV=development
DEBUG=true

# Server
PORT=8080
PYTHON_PORT=8000
HOST=0.0.0.0

# Database (if needed)
# DB_URL=

# API Keys (if needed)
# API_KEY=

EOF
  echo "✅ .env created - update with your settings"
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. npm start        - Start Express server"
echo "   2. npm run py:start - Start Python API (in another terminal)"
echo "   3. Open http://localhost:8080"
echo ""
