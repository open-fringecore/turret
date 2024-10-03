# Installing docker
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker rootless setup
sudo apt-get install uidmap docker-ce-rootless-extras -y

# Disable the system-wide daemon. (do you really need it on a dev machine?)
sudo systemctl disable --now docker.service docker.socket

# dockerd-rootless-setuptool.sh install
dockerd-rootless-setuptool.sh install

# Ask Docker CLI to use it
grep -qxF 'export PATH=/usr/bin:$PATH' ~/.bashrc || echo 'export PATH=/usr/bin:$PATH' >> ~/.bashrc
grep -qxF 'export DOCKER_HOST=unix:///run/user/1000/docker.sock' ~/.bashrc || echo 'export DOCKER_HOST=unix:///run/user/1000/docker.sock' >> ~/.bashrc

# Reload the shell
source ~/.bashrc

# this one tells your system to allow it.
sudo setcap cap_net_bind_service=ep $(which rootlesskit)

# notice the lack of `sudo`
systemctl --user restart docker

# start it right now
systemctl --user start docker

# at boot
systemctl --user enable docker

# Enable linger to keep the user service running after closing the terminal
sudo loginctl enable-linger $USER

# Edit systemd’s Login Session Config
sudo grep -qxF 'UserStopDelaySec=infinity' /etc/systemd/logind.conf || echo 'UserStopDelaySec=infinity' >> /etc/systemd/logind.conf
sudo grep -qxF 'KillUserProcesses=no' /etc/systemd/logind.conf || echo 'KillUserProcesses=no' >> /etc/systemd/logind.conf

# Restart the docker service
systemctl --user restart docker.service

export TURRET_PATH=$(pwd)
export TURRET_DOCKER_SOCKET=/run/user/1000/docker.sock
docker compose up