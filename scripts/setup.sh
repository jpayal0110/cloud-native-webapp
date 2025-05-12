#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Define variables
APP_GROUP="csye6225_group"
APP_USER="csye6225_user"
APP_DIR="/opt/csye6225"
ZIP_FILE="/opt/csye6225/webapp-forked.zip"
REPO_PATH="/opt/csye6225" # local repo path

# Load environment variables from .env file
if [ -f "$REPO_PATH/.env" ]; then
  echo "Loading environment variables from .env file..."
  export "$(grep -v '^#' "$REPO_PATH/.env" | xargs)"
else
  echo ".env file not found. Please ensure it's present at $REPO_PATH"
  exit 1
fi

# Update package lists and upgrade system
echo "Updating package lists and upgrading system..."
sudo apt update -y && sudo apt upgrade -y

# Install MySQL (You can replace with PostgreSQL or MariaDB if needed)
echo "Installing MySQL Server..."
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# Secure MySQL installation (optional, for production use)
# echo "Securing MySQL installation..."
# sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password'; FLUSH PRIVILEGES;"
#extract DB_NAME, DB_USERNAME and DB_PASSWORD from .env file
DB_NAME=$(grep '^DB_NAME=' /opt/csye6225/.env | cut -d '=' -f2- | xargs)
DB_USER=$(grep '^DB_USER=' /opt/csye6225/.env | cut -d '=' -f2- | xargs)
DB_PASSWORD=$(grep '^DB_PASSWORD=' /opt/csye6225/.env | cut -d '=' -f2- | xargs)
# Create database and user
echo "Setting up database...db= ${DB_NAME}"
sudo mysql -uroot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
echo "DB CREATED"
sudo mysql -u root -p -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
echo "USER CREATED"
sudo mysql -u root -p -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
echo "GRANTS GIVEN"
sudo mysql -u root -p -e "FLUSH PRIVILEGES;"
echo "privileges flush" 
# Create Linux group and user
echo "Creating application group and user..."
sudo groupadd -f $APP_GROUP
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -g $APP_GROUP $APP_USER
    echo "$APP_USER created successfully."
else
    echo "$APP_USER already exists."
fi

# Create application directory
echo "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $APP_USER:$APP_GROUP $APP_DIR
sudo chmod -R 755 $APP_DIR

# Unzip the application files
if [ -f "$ZIP_FILE" ]; then
    echo "Extracting application files..."
    sudo unzip "$ZIP_FILE" -d "$APP_DIR"
    sudo chown -R $APP_USER:$APP_GROUP "$APP_DIR"
    echo "Application setup completed."
else
    echo "Zip file not found. Skipping extraction."
fi

# # Add this script to the repository
# echo "Adding setup script to the web app repository..."
# cp "$0" "$REPO_PATH/setup.sh"
# cd "$REPO_PATH" || exit
# git add setup.sh
# git commit -m "Added automated setup script"
# git push origin main  # Change branch if needed

echo "Setup complete!"