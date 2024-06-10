import subprocess
import sys;
import json
import ast;
input = ast.literal_eval(sys.argv[1])
fullCommand = f"${input}"
subprocess.run(input, shell=True)
sys.stdout.flush()