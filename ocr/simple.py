import easyocr
import time
import json
import sys

# 获取所有启动参数
arguments = sys.argv

start_time = time.time()  # 记录开始时间

reader = easyocr.Reader(['ch_sim']) # this needs to run only once to load the model into memory
result = reader.readtext(arguments[1], detail = 0)

json = json.dumps(result);

print(json)