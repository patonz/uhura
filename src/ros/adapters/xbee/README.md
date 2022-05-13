# COM uhura #
This package is responsible for connecting the communication ***hardware*** devices with the COM middleware interfacing with the robots.

## Version 1.0 ### 

## Authors ##
* Leonardo Montecchiari - leonardo.montecchiari@tii.ae
* Tiziano Manoni - tiziano.manoni@tii.ae
* Dario Albani - dario.albani@tii.ae

## Communication Flow 
<<<< ((( ***incoming message***
1. COM uhura collects the bits through the correct hardware device
2. COM uhura publish the bits to the COM middleware package 
3. COM middleware parse the bits as pre-specified and using ARRC States templates
4. COM middlware forward the translated state using the respective topics

>>>> ))) ***outgoing message***
1. COM middlware receives a state using the respective topics
2. COM middleware translates the state in bits as pre-specified and using ARRC States templates
3. COM middleware publish the bits to COM uhura 
4. COM uhura collects the bits and send it to the correct hardware device

## Supported Devices
- Xbee 900HP(through xbee python API), programmable version also work
