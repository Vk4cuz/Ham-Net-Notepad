# Ham Net Notepad

## Purpose

Ham Net Notepad is a lightweight amateur radio net participation tool.

It is designed for operators participating in a net, not for Net Control.

The application replaces handwritten notes or a OneNote page used to track:

- Current net running order
- Regular participants
- Participant names
- Session notes
- Net history

The application must be simple, fast and usable while actively listening to a live net.

No login is required.

No cloud services are required.

The application should operate entirely on a local PC.

---

# Target Platform

Version 1 shall be:

- HTML
- CSS
- JavaScript

Running locally in a desktop web browser.

No server required.

No database required.

Data may be stored as JSON files and/or browser local storage.

---

# Main Concepts

## Station

A station represents an amateur radio operator.

Fields:

- Callsign
- Name
- Location (optional)
- Permanent Notes
- Last Seen Date
- Participation Count

Example:

VK4MCC
Colin
Mackay
Usually portable

### Operator Settings

The user may define their own callsign.

Example:

VK4CUZ

Future versions may use this to:
- Highlight the operator in the running order
- Show previous and next station
- Improve net awareness

---

## Net

A net represents a recurring amateur radio net.

Examples:

- Sunday North Queensland Net
- Monday Mackay 80m Net
- Wednesday Mackay 2m Net

Each net maintains its own:

- Regular station list
- Previous running order
- History

---

## Session

A session represents one occurrence of a net.

Examples:

- Monday Mackay 80m Net - 23 Nov 2026
- Wednesday Mackay 2m Net - 25 Nov 2026

A session contains:

- Date
- Running order
- Session notes
- Participants

---

# User Interface

## User Interface

### Layout

After a net is selected, the screen shall display two panes.

#### Running Order Pane (Left)

Displays stations currently participating in the net.

Stations are shown in the current running order.

Features:

- Move station up
- Move station down
- Remove station from current session
- Add session notes

Example:

1 VK4NB Neil
2 VK4MCC Colin
3 VK4FRC Bob

#### Parked Stations Pane (Right)

Displays stations associated with the selected net that are not currently participating.

When a parked station is selected:

- The station is removed from the parked list.
- The station is added to the end of the running order list.

When a station is removed from the running order:

- The station is removed from the running order.
- The station returns to the parked list.

Example:

Parked Stations

VK4CMW Mick
VK4HBB Brian
VK4FUQ Felix

### Session Start

At the start of a new session:

- The running order list shall be empty.
- All stations associated with the selected net shall appear in the parked stations list.
- Stations from the previous session are not automatically added to the running order.

The operator adds participants to the running order as they check into the net.

### Reordering

The running order shall be easily modified during the net.

The operator may move stations:

- Up
- Down

The running order can differ from previous sessions and may be adjusted at any time.


## Net Selection

The user may select an existing net from a dropdown list or create a new net.

Example:

Net:
[ Monday Mackay 80m ▼ ]

When a net is selected:

- The net's station list is loaded.
- The parked station list is ordered using the most recent session's final running order.
- The running order list starts empty.
- The operator adds stations to the running order as they check into the net.

The selected net becomes the active working session.

---

## Known Stations Panel

Display stations commonly associated with the selected net.

Stations are sorted by:

- Most recently seen first

or

- Previous running order

User can:

- Click station to add to current session
- Search for station
- Edit station information

Display:

Callsign
Name

Example:

VK4NB Neil
VK4MCC Colin
VK4FRC Bob

---

## Tonight's Net Panel

Displays current running order.

Example:

1 VK4NB Neil
2 VK4MCC Colin
3 VK4FRC Bob

User can:

- Move station up
- Move station down
- Remove station
- Add session notes

The order must be easily modified during the net.

This is a primary feature of the application.

---

## Station Search

Search box allows:

- Callsign lookup
- Partial callsign search
- Name search

Examples:

nb
Neil
vk4nb

Matching stations are displayed.

If no station exists:

Create New Station

Station Search should support:

- Exact callsign matches
- Partial callsign matches
- Case-insensitive searching
- Name searching

Example:

Searching for "hbb" should find VK4HBB.


---

## Session Notes

Each participant may have optional notes for the current session.

Examples:

59

Portable from Finch Hatton

Using new antenna

These notes are stored in the session history.

They do not modify permanent station notes.

Session notes are associated with a specific session only.

Permanent station notes are retained between sessions.

---

# Data Storage

The application shall provide explicit Save and Load functions.

Users should not rely solely on browser local storage.

Data should be exportable to local JSON files.

## Station Database

Maintain a shared station database.

A station exists only once.

Multiple nets may reference the same station.

Example:

VK4NB appears in:

- Sunday North Queensland Net
- Monday Mackay 80m Net

without duplication.

---

## Net Configuration

Each net stores:

- Name
- Regular participant list
- Previous running order

### Net Membership

A station may belong to multiple nets.

Example:

VK4NB may appear in:
- Sunday North Queensland Net
- Monday Mackay 80m Net
- Wednesday Mackay 2m Net

Adding a station to one net does not automatically add it to other nets.

The station database is shared.
Net membership lists are maintained independently.

---

## Session History

When a net session is saved:

Create a history record.

History shall be human-readable.

Preferred format:

Markdown

Example:

2026-11-23_Mackay80m.md

Contains:

- Date
- Net name
- Running order
- Session notes

---

# Workflow

Typical use:

1. Select net
2. Start session
3. Add participating stations
4. Adjust running order as required
5. Add session notes where desired
6. Save session

When saved:

- History file created
- Last seen dates updated
- Participation counts updated
- Final running order becomes the default ordering of parked stations for the next session, along with previous parked stations for that net added to the end of the list.
---

# Non-Goals

Version 1 shall NOT include:

- Net control functions
- User accounts
- Login
- Cloud storage
- Shared sessions
- Chat
- ADIF logging
- Contest logging
- LoTW support
- Awards tracking
- QSL management

Keep Version 1 simple.

---

# Future Enhancements

These are explicitly out of scope for Version 1.

## QRZ Lookup

Lookup callsign information.

Display:

- Name
- Location

Allow opening full QRZ page.

Local station information always overrides QRZ information.

QRZ is advisory only.

---

## Drag and Drop

Allow drag-and-drop reordering.

Version 1 may use Up and Down buttons.

---

## Statistics

Attendance counts.

Most frequent participants.

Participation graphs.

Attendance history.

---

## Shared Sessions

Allow multiple users to view or share a session.

Must remain optional.

Version 1 remains fully functional offline.

---

## Chat

Optional lightweight message exchange.

Examples:

"Phone call - skip me this round"

"Back now"

Must not require central infrastructure.

Not part of Version 1.

---

# Design Principles

- Fast
- Simple
- Local-first
- No login
- No subscriptions
- No cloud dependency
- Easy to use during a live net
- Optimised for participants, not Net Control

## Implementation Guidance

For Version 1:

- Prefer plain HTML, CSS and JavaScript.
- Do not use complex frameworks.
- Do not require a backend server.
- Keep code simple and maintainable.
- Prioritise functionality over appearance.
- The application should run directly from local files where practical.

A working simple solution is preferred over a technically sophisticated solution.
