cmake_minimum_required(VERSION 3.0.2)
project(uhura_ros)

## Compile as C++11, supported in ROS Kinetic and newer
# add_compile_options(-std=c++11)

## Find catkin macros and libraries
## if COMPONENTS list like find_package(catkin REQUIRED COMPONENTS xyz)
## is used, also find other catkin packages
find_package(catkin REQUIRED COMPONENTS
  message_generation
  rospy
  std_msgs
)

## Generate messages in the 'msg' folder
add_message_files(
   FILES
   
   Vehicle.msg
   Coordinates.msg
   Position.msg
  # Message2.msg
 )

## Generate services in the 'srv' folder
 add_service_files(
   FILES
   SendStringData.srv
   SendPositionData.srv
   SetupNetworkDevice.srv
   TestBroadcastNetwork.srv
   SendBitsStringData.srv
#   Service2.srv
 )

## Generate actions in the 'action' folder
# add_action_files(
#   FILES
#   Action1.action
#   Action2.action
# )

## Generate added messages and services with any dependencies listed here
 generate_messages(
   DEPENDENCIES
   std_msgs  # Or other packages containing msgs
 )

catkin_package(
#  INCLUDE_DIRS include
#  LIBRARIES uhura_ros
  CATKIN_DEPENDS message_runtime rospy
#  DEPENDS system_lib
)

###########
## Build ##
###########

## Specify additional locations of header files
## Your package locations should be listed before other locations
include_directories(
# include
  ${catkin_INCLUDE_DIRS}
)

