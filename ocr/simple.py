import easyocr
import time
import json

start_time = time.time()  # 记录开始时间


reader = easyocr.Reader(['ch_sim']) # this needs to run only once to load the model into memory
result = reader.readtext('/Users/zhouyunge/Downloads/brook-img-texts.png', detail = 0)

json = json.dumps(result);

print(json)

# end_time = time.time()  # 记录结束时间

# elapsed_time = end_time - start_time  # 计算耗时
# print(f"函数执行耗时：{elapsed_time} 秒")