#!/bin/bash

# Path to your Python script
SCRIPT="m.py"

# Infinite loop to restart the script if it crashes
while true; do
    python3 $SCRIPT
    EXIT_CODE=$?
    
    # You can customize the exit codes or conditions to break the loop if needed
    if [ $EXIT_CODE -eq 0 ]; then
        echo "Script exited normally with code $EXIT_CODE. Not restarting."
        break
    fi

    # Optional: Wait a bit before restarting
    sleep 2
    echo "Restarting script after crash..."
done
