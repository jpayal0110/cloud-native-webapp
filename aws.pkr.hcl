variable "aws_accounts" {
  type = map(string)
  default = {
    dev  = "941377124212"
    demo = "412381782827"
  }
}
variable "image_name" {
  type        = string
  default     = "custom-image-{{ timestamp }}"
  description = "Custom build image name"
}

variable "machine_type" {
  type        = string
  default     = "e2-micro"
  description = "Machine type for the temporary instance"
}

variable "source_image" {
  type        = string
  default     = "ubuntu-2404-noble-amd64-v20250214"
  description = "Base image to use for the build"
}

packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "custom-image-{{ timestamp }}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  ami_users     = [var.aws_accounts["dev"], var.aws_accounts["demo"]]
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true #Selects the latest matching AMI.
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
}

build {
  name = "learn-packer"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "file" {
    source      = "app.zip"
    destination = "/home/ubuntu/app.zip"
  }
  provisioner "file" {
    source      = "csye6225.service"
    destination = "/home/ubuntu/csye6225.service"
  }

  provisioner "file" {
    source      = "cloudwatch-config.json"
    destination = "/home/ubuntu/cloudwatch-config.json"
  }

  #Provisioner to install MySQL and Dependencies
  provisioner "shell" {
    inline = [

      #installation
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y",
      "sudo apt-get install -y software-properties-common",
      "sudo add-apt-repository 'deb http://archive.ubuntu.com/ubuntu/ jammy universe'",
      "sudo apt-get update -y",
      "sudo apt-get install -f -y",
      "sudo apt-get install -y unzip",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",
      "sudo apt-get install mysql-client -y",
      "sudo apt install -y python3 python3-pip",
      "curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\"",
      "unzip awscliv2.zip",
      "sudo ./aws/install",
      "sudo node -v",
      "sudo npm -v",
      "which cloud-init",
      "sudo apt update && sudo apt install cloud-init -y",
      "cloud-init status --wait",
      "echo '1st part of installation done'",

      #CloudWatch Agent installation
      "echo 'Installing CloudWatch Agent...'",
      "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i amazon-cloudwatch-agent.deb",
      "echo '2nd part of installation done'",

      # Create Local User (Non-Login User)
      "sudo groupadd csye6225 || true",
      "sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225 || true",
      "echo 'Create Local User done'",

      # Set Up Application Directory
      "sudo mkdir -p /opt/app",
      "sudo mv /home/ubuntu/app.zip /opt/app/",
      "cd /opt/app && sudo unzip app.zip",
      "sudo chown -R csye6225:csye6225 /opt/app",
      "sudo chmod 750 /opt/app",
      "echo 'Set Up Application Directory done'",

      # Install Node.js dependencies
      "cd /opt/app && sudo npm install winston winston-cloudwatch",
      "echo 'Node.js dependencies installed done'",

      # Environment Variables
      "sudo touch /opt/app/.env",
      "sudo chown csye6225:csye6225 /opt/app/.env",
      "sudo chmod 640 /opt/app/.env",
      "echo 'Environment Variables done'",

      # Create Logs Directory
      "sudo mkdir -p /opt/app/logs",
      "sudo chown -R csye6225:csye6225 /opt/app/logs",
      "sudo chmod 755 /opt/app/logs",
      "echo 'Create Logs Directory done'",

      # Create Directories for CloudWatch Configuration
      "sudo mkdir -p /opt/app/aws/amazon-cloudwatch-agent/etc/",
      "sudo mkdir -p /opt/app/aws/amazon-cloudwatch-agent/bin/",

      # CloudWatch Config File Move
      "echo 'Moving CloudWatch Config File...'",
      "sudo mv /home/ubuntu/cloudwatch-config.json /opt/app/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",

      # Move Systemd Service File & Set Permissions
      "sudo mv /home/ubuntu/csye6225.service /etc/systemd/system/csye6225.service",
      "sudo chown csye6225:csye6225 /etc/systemd/system/csye6225.service",
      "sudo chmod 644 /etc/systemd/system/csye6225.service",
      "echo 'Systemd Service done'",
      "echo 'Cat csye6225.service'",
      "cat /etc/systemd/system/csye6225.service",

      # Enable & Start the Service
      "sudo systemctl daemon-reload",
      "sudo systemctl enable csye6225",
      "sudo systemctl start csye6225 || (echo 'Service failed to start' && journalctl -xeu csye6225.service && exit 1)",

      "echo 'Create Logs Directory done'"
    ]
  }

}
