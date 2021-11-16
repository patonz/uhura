from dotenv import load_dotenv
from digi.xbee.devices import XBeeDevice
import sched, time, sys, os

load_dotenv()
print()
PORT = os.environ.get('PORT') 
DEVICE_NAME = os.environ.get('DEVICE_ID')
BAUD_RATE = os.environ.get('BAUD_RATE')
DELAY_SEND = os.environ.get('DELAY_SEND') #seconds in float




DATA_TO_SEND = DEVICE_NAME+" sending something dummy payload"
schedule = sched.scheduler(time.time, time.sleep)
device = XBeeDevice(PORT, BAUD_RATE)

def sendBroadCastData(params):
    print("Sending data to %s >> %s..." % ("BROADCAST", DATA_TO_SEND))
    device.send_data_broadcast(DATA_TO_SEND)
    schedule.enter(DELAY_SEND, 1, sendBroadCastData, (params,))


def main():
    print(" +-----------------------------------------+")
    print(" | XBee Python Library Receive Data Sample |")
    print(" +-----------------------------------------+\n")

    try:
        device.open()
        schedule.enter(DELAY_SEND, 1, sendBroadCastData, (schedule,))
        def data_receive_callback(xbee_message):
            print("From %s >> %s" % (xbee_message.remote_device.get_node_id(),
                                     xbee_message.data.decode()))

        device.add_data_received_callback(data_receive_callback)

        print("Waiting for data...\n")
        schedule.run()

    finally:
        if device is not None and device.is_open():
            device.close()

    device.open()
if __name__ == '__main__':
    main()