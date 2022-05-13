
# Python program to explain os.mkdir() method
  
# importing os module
import os
from tool_manager import ToolManager
from pathlib import Path
  
tl = ToolManager('testancora.tx')

tl.log_to_file('ciaone')
# Directory
directory = "uhe"
  
# Parent Directory path
parent_dir = str(Path.home())
  
# Path
path = os.path.join(parent_dir, directory)
  
# Create the directory
# 'GeeksForGeeks' in
# '/home / User / Documents'
os.mkdir(path)
print("Directory '% s' created" % directory)
  
# Directory
directory = "Geeks"
  
# Parent Directory path
parent_dir = "D:/Pycharm projects"
  
# mode
mode = 0o666
  
# Path
path = os.path.join(parent_dir, directory)
  
# Create the directory
# 'GeeksForGeeks' in
# '/home / User / Documents'
# with mode 0o666
os.mkdir(path, mode)
print("Directory '% s' created" % directory)