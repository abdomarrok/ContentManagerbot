# ContentManagerbot

This is a simple bot built with the Telegraf library for managing a main menu with buttons. It allows users to add new buttons to the menu and delete existing buttons. Admin users have additional privileges and can perform more actions on the menu.

## Getting Started
To run this bot, you'll need to have Node.js installed on your computer. Clone the repository and run the following command to install the required dependencies:

<code>
npm install
</code>
Create a .env file in the root directory of the project with the following content:

##makefile
<code>
BOT_TOKEN=<your bot token>
Admin_IDs=<admin user IDs separated by commas>
</code>

Replace <your bot token> with your Telegram bot token and <admin user IDs separated by commas> with a comma-separated list of Telegram user IDs for admin users.

To start the bot, run the following command:

sql

<code> npm start</code>

## Usage
Once the bot is up and running, you can use the following commands:

<code> /start, /help, or /goToMainMenu: </code> Show the main menu.
Click on a button in the main menu to perform an action.
If you're an admin user, you'll see additional options to add or delete buttons in the main menu.
## Contributing
Contributions are always welcome! If you have any ideas or suggestions, feel free to create an issue or submit a pull request.

