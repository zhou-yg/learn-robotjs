import easyocr
import time
import json
import sys

start_time = time.time()  # 记录开始时间

reader = easyocr.Reader(['ch_sim']) # this needs to run only once to load the model into memory
result = reader.readtext('/Users/zhouyunge/Documents/learn-robotjs/imgs/turns.jpg', detail = 0)

print(result);

end_time = time.time()

execution_time = end_time - start_time
print("执行时间：", execution_time, "秒");