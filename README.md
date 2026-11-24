# Ham Net Notepad

Ham Net Notepad is a lightweight amateur radio net participant tracker designed for operators participating in nets rather than Net Control.

The project was inspired by years of maintaining amateur radio net participant lists in OneNote. It provides a simple, local-first alternative for tracking the current running order, participant information, notes, and session history without accounts, subscriptions, or cloud services.

## Features

- Multiple net support
- Shared station database
- Running order management
- Parked station management
- Quick Add Station
- Session notes
- Participation history
- JSON import/export
- Local browser storage
- Offline operation

## Why Ham Net Notepad?

Most amateur radio logging and net software focuses on the needs of Net Control. Ham Net Notepad instead focuses on individual participants who want to maintain their own running order and notes while listening to a net.

It is intended to replace handwritten notes or a general-purpose notebook with a fast, focused tool for checking in stations, changing their order, recording short session notes, and keeping a local history.

### Installation

1. Download the latest release from GitHub or clone the repository.
2. Copy the application files to a folder of your choice.
3. Open `index.html` in a modern web browser.

No installation program is required.

No server is required.

No account is required.

No internet connection is required for normal operation.

## Basic Usage

1. Create or select a net.
2. Add stations from the parked list or use **Quick Add Station**.
3. Reorder stations with the Up and Down controls.
4. Select a station to add an optional session note.
5. Select **Save session** when the net is complete.
6. Export JSON backups periodically.

Stations removed from the running order return to the parked list. Existing stations can be reused across multiple nets through the shared station database.

## Data Storage

Data is stored locally in the browser using local browser storage. It is not sent to a server or shared between computers or browser profiles.

Export JSON regularly to create a backup or transfer data to another browser. JSON backups can be restored through the application's Import function.

Saved session history remains available locally and can be downloaded as Markdown.

## Screenshots

Screenshots will be added here.

<!-- Add screenshots of the running order, parked stations, and session history. -->

## Future Ideas

Possible future enhancements include:

- QRZ lookup
- Attendance statistics
- Drag-and-drop ordering
- Shared sessions
- Lightweight operator chat

These are ideas for future development and are not current features.

## Credits

Created by:

**Gary Crothers VK4CUZ**

Built with assistance from Microsoft Copilot.

## Licence

This project is licensed under the MIT License.

See the LICENSE file for details.

## Disclaimer

Ham Net Notepad is a hobby project provided as-is.

Users are responsible for maintaining backups of their data using the Export function.
