FROM balenalib/raspberrypi4-64-ubuntu:latest
RUN install_packages cmake g++ python3-pip wget git
RUN install_packages libasio-dev libtinyxml2-dev libssl-dev libp11-dev libengine-pkcs11-openssl softhsm2
RUN usermod -a -G softhsm root
RUN install_packages libengine-pkcs11-openssl
RUN pip3 install -U colcon-common-extensions vcstool

