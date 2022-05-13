#!/bin/bash
# Author: Leonardo Montecchiari
# Author: Dario Albani

# WHAT: 
# Automatic installation of uhura blemesh requirements 

# OTHER DEPENDENCIES:
# nodejs >= 12, tested on 16

echo "copying uhura rules"
sudo cp -f 50-uhura.rules /etc/udev/rules.d/ 

echo "install npm modules"
cd .. && npm install

# needed for roslaunch not for npm run
cd scripts && chmod +x *.js

echo ""


#reloads udev rules
sudo service udev restart

#trigger usb ports
sudo udevadm control --reload-rules && udevadm trigger


echo ""
