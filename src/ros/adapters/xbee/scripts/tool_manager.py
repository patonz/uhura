import glob
import logging
import os
import os.path
import sys
import time
from typing import Optional

from pathlib import Path


import rospy
import serial


class ToolManager:

    NAME_FILE = None
    dir_name = 'uhura_log'
    home = str(Path.home())
    xbee_folder = 'xbee'
    path = os.path.join(home, '.ros', dir_name, xbee_folder)
    full_path = None

    def __init__(self, name_file):
        self.NAME_FILE = name_file
        self.full_path = os.path.join(self.path, self.NAME_FILE)
        print(self.full_path)
        self.create_log_folder()
        pass

    def create_log_folder(self):
        if not os.path.isdir(self.path):
            os.mkdir(self.path)
        else:
            rospy.logdebug("folder %s exist, skipping creation" % self.path)

    def log_to_file(self, data):
        try:
            with open(self.full_path, 'a') as f:
                print(data, file=f)
        except Exception as e:
            rospy.logerr('log_to_file error: %s' % e.__class__)
        return

    def xbee_serial_port(self):

        ports = glob.glob('/dev/uhura_XBEE_DEVICE_[0-9]*')
        result = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result.append(port)
            except (OSError, serial.SerialException):
                pass
        return result

    def serial_ports(self):
        """ Lists serial port names

            :raises EnvironmentError:
                On unsupported or unknown platforms
            :returns:
                A list of the serial ports available on the system
        """
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            #ports = glob.glob('/dev/tty[A-Za-z]*')
            ports = glob.glob('/dev/uhura_XBEE_DEVICE_[0-9]*') # TODO call dedicated function instead
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.*')
        else:
            raise EnvironmentError('Unsupported platform')
        result = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result.append(port)
            except (OSError, serial.SerialException):
                pass
        return result

    def activate_serial_port(self, port, baudrate):
            ser = serial.Serial(port, baudrate, timeout=1)
            ser.close()  # close any other old serial connection
            ser.open()
            time.sleep(1)
            rospy.logdebug('sending ENTER char')
            ser.write(b'\r')  # mock an ENTER action
            time.sleep(1)
            rospy.logdebug('sending B char')
            ser.write(b'B')  # activate the B - Bypass Mode
            ser.close()  # close for the Xbee normal usage
            time.sleep(1)

    def int_to_bytes(self, x: int) -> bytes:
        return x.to_bytes((x.bit_length() + 7) // 8, 'big')

    def int_from_bytes(xbytes: bytes) -> int:
        return int.from_bytes(xbytes, 'big')

    def int_to_bytes(self, number: int) -> bytes:
        return number.to_bytes(length=(8 + (number + (number < 0)).bit_length()) // 8, byteorder='big', signed=True)

    def int_from_bytes(binary_data: bytes) -> Optional[int]:
        return int.from_bytes(binary_data, byteorder='big', signed=True)

    def bitstring_to_bytes(self, s):
        return int(s, 2).to_bytes((len(s) + 7) // 8, byteorder='big')

    def bytes_to_bitstring(self, s: bytes):
        return ''.join(format(byte, '08b') for byte in s)

    def int_to_bit(self, number: int, max_bit:int):
        return bin(number)[2:].zfill(max_bit)

    def bitstring_to_int(self, bitstring):
        return int(bitstring,2)

    def set_rospy_log_lvl(self, log_level):
        logger = logging.getLogger('rosout')
        logger.setLevel(rospy.impl.rosout._rospy_to_logging_levels[log_level])
