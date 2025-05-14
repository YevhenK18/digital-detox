Digital Detox
A Chrome extension to track and limit time spent on websites, featuring a sleek dark neo-noir design with neon accents.
Features

Track time spent on specified websites in real-time.
Set time limits for websites and block access when exceeded.
Pause tracking for 5 minutes with a single click.
View daily usage statistics in a clean, neon-styled interface.
Add the current website to the tracking list directly from the popup.

Installation

Clone or download this repository:git clone https://github.com/YevhenK18/digital-detox.git


Open Chrome and go to chrome://extensions/.
Enable "Developer mode" in the top right.
Click "Load unpacked" and select the digital-detox folder.
The extension should now appear in your Chrome toolbar.

Usage

Click the Digital Detox icon in the Chrome toolbar to open the popup.
Add a website to track by entering its domain (e.g., youtube.com) and clicking "Add".
Optionally set a time limit for the website in minutes.
View real-time time spent and remaining time for the current website.
Pause tracking for 5 minutes or check daily stats in the "Time Spent Today" section.
If on a non-tracked site, click "Add to Track" to start tracking it immediately.

Files

manifest.json: Extension configuration.
popup.html: Popup UI structure.
popup.js: Popup logic for tracking, limits, and UI updates.
background.js: Background script for time tracking and blocking.
content.js: Content script for blocking websites when limits are exceeded.
styles.css: Dark neo-noir styling with neon accents.

Contributing
Feel free to fork this repository, make improvements, and submit a pull request. For major changes, please open an issue to discuss your ideas.

Acknowledgments
Built with inspiration from neo-noir aesthetics and a focus on minimal, user-friendly design.
