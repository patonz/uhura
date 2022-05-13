#!/bin/bash
# Author: Leonardo Montecchiari
# Author: Dario Albani

# WHAT: 
# Automatic installation of uhura requirements 

# OTHER DEPENDENCIES:
# pip 

declare -a REQUIREMENTS=(digi-xbee)

echo "Installing uhura requirements:"
for REQ in ${REQUIREMENTS[@]}
do
  echo "- processing $REQ"
  pip install -q $REQ
done

echo ""
echo "copying uhura rules"
sudo cp -f 60-uhura.rules /etc/udev/rules.d/ 

#reloads udev rules
sudo service udev restart

#trigger usb ports
sudo udevadm control --reload-rules && udevadm trigger


echo ""
echo "generating python3 symbolic link"
sudo ln -sfn /usr/bin/python3 /usr/bin/python
