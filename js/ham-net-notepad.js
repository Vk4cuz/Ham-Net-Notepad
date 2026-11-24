(function () {
  "use strict";

  var APP_VERSION = "v1.0.0";
  var STORAGE_KEY = "ham-net-notepad-v1";
  var state = loadState();
  var statusTimer;

  var elements = {
    netSelect: document.getElementById("net-select"),
    aboutTitle: document.getElementById("about-title"),
    aboutDialog: document.getElementById("about-dialog"),
    closeAbout: document.getElementById("close-about"),
    openHelp: document.getElementById("open-help"),
    helpDialog: document.getElementById("help-dialog"),
    closeHelp: document.getElementById("close-help"),
    newNetButton: document.getElementById("new-net-button"),
    newNetForm: document.getElementById("new-net-form"),
    newNetName: document.getElementById("new-net-name"),
    cancelNewNet: document.getElementById("cancel-new-net"),
    sessionDateLabel: document.getElementById("session-date-label"),
    runningOrder: document.getElementById("running-order"),
    runningEmpty: document.getElementById("running-empty"),
    runningHeading: document.getElementById("running-heading"),
    parkedStations: document.getElementById("parked-stations"),
    parkedEmpty: document.getElementById("parked-empty"),
    parkedHeading: document.getElementById("parked-heading"),
    stationSearch: document.getElementById("station-search"),
    quickAddForm: document.getElementById("quick-add-form"),
    quickAddInput: document.getElementById("quick-add-input"),
    saveSession: document.getElementById("save-session"),
    sessionHistory: document.getElementById("session-history"),
    downloadHistory: document.getElementById("download-history"),
    stationEditor: document.getElementById("station-editor"),
    stationEditorHeading: document.getElementById("station-editor-heading"),
    stationForm: document.getElementById("station-form"),
    stationId: document.getElementById("station-id"),
    stationCallsign: document.getElementById("station-callsign"),
    stationName: document.getElementById("station-name"),
    stationLocation: document.getElementById("station-location"),
    stationNotes: document.getElementById("station-notes"),
    stationFormHint: document.getElementById("station-form-hint"),
    newStationButton: document.getElementById("new-station-button"),
    cancelStationEditor: document.getElementById("cancel-station-editor"),
    exportData: document.getElementById("export-data"),
    importData: document.getElementById("import-data"),
    importFile: document.getElementById("import-file"),
    statusMessage: document.getElementById("status-message"),
    runningTemplate: document.getElementById("running-station-template"),
    parkedTemplate: document.getElementById("parked-station-template")
  };

  document.querySelectorAll("[data-app-version]").forEach(function (element) {
    element.textContent = APP_VERSION;
  });

  function createId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function localDate() {
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function sampleState() {
    return {
      version: 1,
      selectedNetId: "net-monday",
      stations: {
        "station-vk4nb": {
          id: "station-vk4nb",
          callsign: "VK4NB",
          name: "Neil",
          location: "Mackay",
          permanentNotes: "Regular participant",
          lastSeen: "2026-11-16",
          participationCount: 2
        },
        "station-vk4mcc": {
          id: "station-vk4mcc",
          callsign: "VK4MCC",
          name: "Colin",
          location: "Mackay",
          permanentNotes: "Usually portable",
          lastSeen: "2026-11-16",
          participationCount: 2
        },
        "station-vk4frc": {
          id: "station-vk4frc",
          callsign: "VK4FRC",
          name: "Bob",
          location: "",
          permanentNotes: "",
          lastSeen: "2026-11-16",
          participationCount: 2
        },
        "station-vk4cmw": {
          id: "station-vk4cmw",
          callsign: "VK4CMW",
          name: "Mick",
          location: "Sarina",
          permanentNotes: "",
          lastSeen: "2026-11-09",
          participationCount: 1
        },
        "station-vk4hbb": {
          id: "station-vk4hbb",
          callsign: "VK4HBB",
          name: "Brian",
          location: "",
          permanentNotes: "",
          lastSeen: "",
          participationCount: 0
        }
      },
      nets: [
        {
          id: "net-monday",
          name: "Monday Mackay 80m Net",
          stationIds: [
            "station-vk4nb",
            "station-vk4mcc",
            "station-vk4frc",
            "station-vk4cmw",
            "station-vk4hbb"
          ],
          previousRunningOrder: ["station-vk4nb", "station-vk4mcc", "station-vk4frc"]
        },
        {
          id: "net-sunday",
          name: "Sunday North Queensland Net",
          stationIds: ["station-vk4nb", "station-vk4mcc"],
          previousRunningOrder: ["station-vk4mcc", "station-vk4nb"]
        }
      ],
      drafts: {
        "net-monday": { date: localDate(), entries: [] },
        "net-sunday": { date: localDate(), entries: [] }
      },
      history: []
    };
  }

  function validateState(candidate) {
    return candidate &&
      candidate.version === 1 &&
      candidate.stations &&
      Array.isArray(candidate.nets) &&
      candidate.nets.length > 0 &&
      candidate.drafts &&
      Array.isArray(candidate.history);
  }

  function loadState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return sampleState();
      }
      var parsed = JSON.parse(saved);
      if (!validateState(parsed)) {
        throw new Error("Saved data has an unsupported structure.");
      }
      return parsed;
    } catch (error) {
      window.setTimeout(function () {
        showStatus("Could not load saved data. Sample data is being used.", true);
      }, 0);
      return sampleState();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showStatus("Unable to save in browser storage. Export your data to keep a backup.", true);
    }
  }

  function showStatus(message, isError) {
    window.clearTimeout(statusTimer);
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.toggle("error", Boolean(isError));
    statusTimer = window.setTimeout(function () {
      elements.statusMessage.textContent = "";
      elements.statusMessage.classList.remove("error");
    }, 5000);
  }

  function getSelectedNet() {
    return state.nets.find(function (net) {
      return net.id === state.selectedNetId;
    }) || state.nets[0];
  }

  function getDraft(net) {
    if (!state.drafts[net.id]) {
      state.drafts[net.id] = { date: localDate(), entries: [] };
    }
    return state.drafts[net.id];
  }

  function normalizeCallsign(value) {
    return value.trim().toUpperCase().replace(/\s+/g, "");
  }

  function stationDisplayName(station) {
    return station.callsign + (station.name ? " " + station.name : "");
  }

  function formatDate(dateString) {
    var parts = dateString.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return dateString;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString();
  }

  function renderNetOptions() {
    elements.netSelect.replaceChildren();
    state.nets.forEach(function (net) {
      var option = document.createElement("option");
      option.value = net.id;
      option.textContent = net.name;
      option.selected = net.id === state.selectedNetId;
      elements.netSelect.appendChild(option);
    });
  }

  function renderRunningOrder() {
    var net = getSelectedNet();
    var draft = getDraft(net);
    elements.runningOrder.replaceChildren();

    draft.entries.forEach(function (entry, index) {
      var station = state.stations[entry.stationId];
      if (!station) {
        return;
      }

      var card = elements.runningTemplate.content.cloneNode(true);
      card.querySelector(".order-number").textContent = index + 1 + ".";
      card.querySelector(".callsign").textContent = station.callsign;
      card.querySelector(".station-name").textContent = station.name;

      var upButton = card.querySelector(".move-up");
      var downButton = card.querySelector(".move-down");
      upButton.disabled = index === 0;
      downButton.disabled = index === draft.entries.length - 1;
      upButton.addEventListener("click", function () {
        moveEntry(index, -1);
      });
      downButton.addEventListener("click", function () {
        moveEntry(index, 1);
      });
      card.querySelector(".park-station").addEventListener("click", function () {
        removeFromRunning(entry.stationId);
      });

      var note = card.querySelector(".session-note");
      var noteEditor = card.querySelector(".note-editor");
      var noteIndicator = card.querySelector(".note-indicator");
      var stationSelect = card.querySelector(".station-select");
      note.value = entry.note || "";
      noteIndicator.hidden = !note.value;
      noteIndicator.textContent = "N";
      noteIndicator.setAttribute(
        "aria-label",
        "Edit session note for " + station.callsign
      );

      function toggleNoteEditor() {
        noteEditor.hidden = !noteEditor.hidden;
        if (!noteEditor.hidden) {
          note.focus();
        }
      }

      stationSelect.setAttribute("aria-label", "Edit note for " + station.callsign);
      stationSelect.addEventListener("click", toggleNoteEditor);
      noteIndicator.addEventListener("click", toggleNoteEditor);
      note.addEventListener("input", function () {
        entry.note = note.value;
        noteIndicator.hidden = !note.value.trim();
        persist();
      });
      elements.runningOrder.appendChild(card);
    });

    elements.runningEmpty.hidden = draft.entries.length > 0;
    elements.runningHeading.textContent =
      "Tonight's Running Order (" + draft.entries.length + ")";
    elements.saveSession.disabled = draft.entries.length === 0;
  }

  function orderedParkedStations(net, searchTerm) {
    var activeIds = new Set(getDraft(net).entries.map(function (entry) {
      return entry.stationId;
    }));
    var memberIds = new Set(net.stationIds);
    var allStations = Object.values(state.stations);
    var term = searchTerm.trim().toLowerCase();
    var matchedGlobal = allStations.filter(function (station) {
      if (activeIds.has(station.id)) {
        return false;
      }
      return !term ||
        station.callsign.toLowerCase().includes(term) ||
        (station.name || "").toLowerCase().includes(term);
    });

    return matchedGlobal.sort(function (a, b) {
      var aMember = memberIds.has(a.id);
      var bMember = memberIds.has(b.id);
      if (term && aMember !== bMember) {
        return aMember ? -1 : 1;
      }
      if (!term && aMember !== bMember) {
        return aMember ? -1 : 1;
      }

      var aIndex = net.previousRunningOrder.indexOf(a.id);
      var bIndex = net.previousRunningOrder.indexOf(b.id);
      var aOrder = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      var bOrder = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return (b.lastSeen || "").localeCompare(a.lastSeen || "") ||
        a.callsign.localeCompare(b.callsign);
    }).filter(function (station) {
      return term || memberIds.has(station.id);
    });
  }

  function renderParkedStations() {
    var net = getSelectedNet();
    var stations = orderedParkedStations(net, elements.stationSearch.value);
    elements.parkedStations.replaceChildren();

    stations.forEach(function (station) {
      var isMember = net.stationIds.includes(station.id);
      var card = elements.parkedTemplate.content.cloneNode(true);
      var addButton = card.querySelector(".add-station");
      card.querySelector(".callsign").textContent = station.callsign;
      card.querySelector(".station-name").textContent = station.name;
      card.querySelector(".station-location").textContent = station.location;
      card.querySelector(".association-note").textContent = isMember ?
        "" : "Shared station - click to add to this net";
      addButton.setAttribute(
        "aria-label",
        (isMember ? "Add " : "Associate and add ") + stationDisplayName(station)
      );
      addButton.addEventListener("click", function () {
        if (!isMember) {
          net.stationIds.push(station.id);
        }
        addToRunning(station.id);
      });
      card.querySelector(".edit-station").addEventListener("click", function () {
        openStationEditor(station.id);
      });
      elements.parkedStations.appendChild(card);
    });

    var memberCount = net.stationIds.filter(function (stationId) {
      return !getDraft(net).entries.some(function (entry) {
        return entry.stationId === stationId;
      });
    }).length;
    elements.parkedHeading.textContent = "Parked Stations (" + memberCount + ")";
    elements.parkedEmpty.hidden = stations.length > 0;
    if (!stations.length && elements.stationSearch.value.trim()) {
      elements.parkedEmpty.textContent =
        "No station found. Create it as a new station and it will be added to this net.";
    } else if (!stations.length) {
      elements.parkedEmpty.textContent = "All net stations are currently in the running order.";
    }
  }

  function renderHistory() {
    var net = getSelectedNet();
    var history = state.history.filter(function (session) {
      return session.netId === net.id;
    }).sort(function (a, b) {
      return b.savedAt.localeCompare(a.savedAt);
    });

    elements.sessionHistory.replaceChildren();
    elements.downloadHistory.disabled = history.length === 0;
    if (!history.length) {
      var empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "No sessions have been saved for this net.";
      elements.sessionHistory.appendChild(empty);
      return;
    }

    history.forEach(function (session) {
      var item = document.createElement("article");
      item.className = "history-item";
      var heading = document.createElement("h3");
      heading.textContent = formatDate(session.date) + " - " + session.entries.length + " stations";
      item.appendChild(heading);

      var list = document.createElement("ol");
      session.entries.forEach(function (entry) {
        var station = entry.stationSnapshot;
        var listItem = document.createElement("li");
        listItem.textContent = stationDisplayName(station);
        if (entry.note) {
          listItem.textContent += " - " + entry.note;
        }
        list.appendChild(listItem);
      });
      item.appendChild(list);
      elements.sessionHistory.appendChild(item);
    });
  }

  function render() {
    var net = getSelectedNet();
    state.selectedNetId = net.id;
    renderNetOptions();
    elements.sessionDateLabel.textContent = "Session date: " + formatDate(getDraft(net).date);
    renderRunningOrder();
    renderParkedStations();
    renderHistory();
    persist();
  }

  function addToRunning(stationId) {
    var net = getSelectedNet();
    var draft = getDraft(net);
    if (!draft.entries.some(function (entry) {
      return entry.stationId === stationId;
    })) {
      draft.entries.push({ stationId: stationId, note: "" });
    }
    persist();
    render();
  }

  function quickAddStation(event) {
    event.preventDefault();
    var entered = elements.quickAddInput.value.trim();
    if (!entered) {
      elements.quickAddInput.focus();
      return;
    }

    var normalizedCallsign = normalizeCallsign(entered);
    var term = entered.toLowerCase();
    var stations = Object.values(state.stations);
    var station = stations.find(function (candidate) {
      return candidate.callsign.toUpperCase() === normalizedCallsign;
    });

    if (!station) {
      var exactNames = stations.filter(function (candidate) {
        return (candidate.name || "").toLowerCase() === term;
      });
      if (exactNames.length === 1) {
        station = exactNames[0];
      } else if (!exactNames.length) {
        var matches = stations.filter(function (candidate) {
          return candidate.callsign.toLowerCase().includes(term) ||
            (candidate.name || "").toLowerCase().includes(term);
        });
        if (matches.length === 1) {
          station = matches[0];
        } else if (matches.length > 1) {
          showStatus(
            "More than one station matches: " +
            matches.slice(0, 5).map(function (match) {
              return match.callsign;
            }).join(", ") + ". Enter a more specific callsign.",
            true
          );
          elements.quickAddInput.select();
          return;
        }
      } else {
        showStatus(
          "More than one station is named " + entered +
            ". Enter a callsign instead.",
          true
        );
        elements.quickAddInput.select();
        return;
      }
    }

    var net = getSelectedNet();
    var draft = getDraft(net);
    if (!station) {
      station = {
        id: createId("station"),
        callsign: normalizedCallsign,
        name: "",
        location: "",
        permanentNotes: "",
        lastSeen: "",
        participationCount: 0
      };
      state.stations[station.id] = station;
    }

    if (draft.entries.some(function (entry) {
      return entry.stationId === station.id;
    })) {
      showStatus(station.callsign + " is already in the running order.", true);
      elements.quickAddInput.select();
      return;
    }

    if (!net.stationIds.includes(station.id)) {
      net.stationIds.push(station.id);
    }
    draft.entries.push({ stationId: station.id, note: "" });
    elements.quickAddInput.value = "";
    persist();
    render();
    elements.quickAddInput.focus();
    showStatus(station.callsign + " added to the running order.");
  }

  function removeFromRunning(stationId) {
    var draft = getDraft(getSelectedNet());
    draft.entries = draft.entries.filter(function (entry) {
      return entry.stationId !== stationId;
    });
    persist();
    render();
  }

  function moveEntry(index, offset) {
    var entries = getDraft(getSelectedNet()).entries;
    var newIndex = index + offset;
    if (newIndex < 0 || newIndex >= entries.length) {
      return;
    }
    var entry = entries.splice(index, 1)[0];
    entries.splice(newIndex, 0, entry);
    persist();
    renderRunningOrder();
  }

  function openStationEditor(stationId) {
    var station = stationId ? state.stations[stationId] : null;
    elements.stationForm.reset();
    elements.stationId.value = station ? station.id : "";
    elements.stationCallsign.value = station ? station.callsign : elements.stationSearch.value.trim();
    elements.stationName.value = station ? station.name : "";
    elements.stationLocation.value = station ? station.location : "";
    elements.stationNotes.value = station ? station.permanentNotes : "";
    elements.stationEditorHeading.textContent = station ? "Edit station" : "New station";
    elements.stationFormHint.textContent = station ?
      "Changes apply everywhere this shared station is used." :
      "The new shared station will be associated with " + getSelectedNet().name + ".";
    elements.stationEditor.hidden = false;
    elements.stationCallsign.focus();
  }

  function closeStationEditor() {
    elements.stationEditor.hidden = true;
    elements.stationForm.reset();
  }

  function saveStation(event) {
    event.preventDefault();
    var callsign = normalizeCallsign(elements.stationCallsign.value);
    if (!callsign) {
      showStatus("A callsign is required.", true);
      return;
    }

    var existing = Object.values(state.stations).find(function (station) {
      return station.callsign.toUpperCase() === callsign;
    });
    var stationId = elements.stationId.value;
    if (existing && existing.id !== stationId) {
      showStatus(
        existing.callsign + " is already in the shared database. Use search to add it to this net.",
        true
      );
      elements.stationSearch.value = existing.callsign;
      closeStationEditor();
      renderParkedStations();
      return;
    }

    var station = stationId ? state.stations[stationId] : {
      id: createId("station"),
      lastSeen: "",
      participationCount: 0
    };
    station.callsign = callsign;
    station.name = elements.stationName.value.trim();
    station.location = elements.stationLocation.value.trim();
    station.permanentNotes = elements.stationNotes.value.trim();
    state.stations[station.id] = station;

    var net = getSelectedNet();
    if (!net.stationIds.includes(station.id)) {
      net.stationIds.push(station.id);
    }
    persist();
    closeStationEditor();
    elements.stationSearch.value = "";
    render();
    showStatus(callsign + " saved.");
  }

  function saveSession() {
    var net = getSelectedNet();
    var draft = getDraft(net);
    if (!draft.entries.length) {
      showStatus("Add at least one station before saving.", true);
      return;
    }

    var savedAt = new Date().toISOString();
    var historyEntry = {
      id: createId("session"),
      netId: net.id,
      netName: net.name,
      date: draft.date,
      savedAt: savedAt,
      entries: draft.entries.map(function (entry) {
        var station = state.stations[entry.stationId];
        return {
          stationId: entry.stationId,
          stationSnapshot: {
            callsign: station.callsign,
            name: station.name,
            location: station.location
          },
          note: entry.note || ""
        };
      })
    };
    state.history.push(historyEntry);

    draft.entries.forEach(function (entry) {
      var station = state.stations[entry.stationId];
      station.lastSeen = draft.date;
      station.participationCount += 1;
    });
    var finalRunningOrder = draft.entries.map(function (entry) {
      return entry.stationId;
    });
    var previousParkedOrder = net.previousRunningOrder.filter(function (stationId) {
      return !finalRunningOrder.includes(stationId);
    });
    var remainingStations = net.stationIds.filter(function (stationId) {
      return !finalRunningOrder.includes(stationId) &&
        !previousParkedOrder.includes(stationId);
    });
    net.previousRunningOrder = finalRunningOrder
      .concat(previousParkedOrder, remainingStations);
    state.drafts[net.id] = { date: localDate(), entries: [] };
    persist();
    render();
    showStatus("Session saved to local history.");
  }

  function historyAsMarkdown() {
    var net = getSelectedNet();
    var sessions = state.history.filter(function (session) {
      return session.netId === net.id;
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date) || a.savedAt.localeCompare(b.savedAt);
    });

    var lines = ["## " + net.name, ""];
    sessions.forEach(function (session) {
      lines.push(
        "### " + session.date,
        "",
        "Participants: " + session.entries.length,
        ""
      );
      session.entries.forEach(function (entry, index) {
        lines.push((index + 1) + ". " + stationDisplayName(entry.stationSnapshot));
      });

      var notes = session.entries.filter(function (entry) {
        return entry.note;
      });
      if (notes.length) {
        lines.push("", "Notes:", "");
        notes.forEach(function (entry) {
          lines.push(
            "- " + entry.stationSnapshot.callsign + ": " +
            entry.note.replace(/\n/g, " ")
          );
        });
      }
      lines.push("");
    });
    return lines.join("\n");
  }

  function downloadFile(filename, contents, type) {
    var blob = new Blob([contents], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportData() {
    downloadFile(
      "ham-net-notepad-" + localDate() + ".json",
      JSON.stringify(state, null, 2),
      "application/json"
    );
    showStatus("Data export started.");
  }

  function importData(file) {
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      try {
        var imported = JSON.parse(reader.result);
        if (!validateState(imported)) {
          throw new Error("This file is not valid Ham Net Notepad data.");
        }
        if (!window.confirm("Replace all current data with the imported data?")) {
          return;
        }
        state = imported;
        if (!getSelectedNet()) {
          state.selectedNetId = state.nets[0].id;
        }
        persist();
        closeStationEditor();
        elements.stationSearch.value = "";
        render();
        showStatus("Data imported successfully.");
      } catch (error) {
        showStatus(error.message || "Could not import this file.", true);
      } finally {
        elements.importFile.value = "";
      }
    });
    reader.addEventListener("error", function () {
      showStatus("Could not read the selected file.", true);
    });
    reader.readAsText(file);
  }

  elements.netSelect.addEventListener("change", function () {
    state.selectedNetId = elements.netSelect.value;
    elements.stationSearch.value = "";
    closeStationEditor();
    render();
  });

  elements.aboutTitle.addEventListener("click", function () {
    elements.aboutDialog.showModal();
  });

  elements.closeAbout.addEventListener("click", function () {
    elements.aboutDialog.close();
  });

  elements.aboutDialog.addEventListener("click", function (event) {
    var bounds = elements.aboutDialog.getBoundingClientRect();
    var clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (clickedOutside) {
      elements.aboutDialog.close();
    }
  });

  elements.aboutDialog.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      elements.aboutDialog.close();
    }
  });

  elements.openHelp.addEventListener("click", function () {
    elements.helpDialog.showModal();
  });

  elements.closeHelp.addEventListener("click", function () {
    elements.helpDialog.close();
  });

  elements.helpDialog.addEventListener("click", function (event) {
    var bounds = elements.helpDialog.getBoundingClientRect();
    var clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (clickedOutside) {
      elements.helpDialog.close();
    }
  });

  elements.helpDialog.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      elements.helpDialog.close();
    }
  });

  elements.newNetButton.addEventListener("click", function () {
    elements.newNetForm.hidden = false;
    elements.newNetName.focus();
  });

  elements.cancelNewNet.addEventListener("click", function () {
    elements.newNetForm.hidden = true;
    elements.newNetForm.reset();
  });

  elements.newNetForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = elements.newNetName.value.trim();
    if (!name) {
      return;
    }
    var duplicate = state.nets.some(function (net) {
      return net.name.toLowerCase() === name.toLowerCase();
    });
    if (duplicate) {
      showStatus("A net with that name already exists.", true);
      return;
    }
    var net = {
      id: createId("net"),
      name: name,
      stationIds: [],
      previousRunningOrder: []
    };
    state.nets.push(net);
    state.selectedNetId = net.id;
    state.drafts[net.id] = { date: localDate(), entries: [] };
    elements.newNetForm.hidden = true;
    elements.newNetForm.reset();
    elements.stationSearch.value = "";
    render();
    showStatus(name + " created.");
  });

  elements.stationSearch.addEventListener("input", renderParkedStations);
  elements.quickAddForm.addEventListener("submit", quickAddStation);
  elements.newStationButton.addEventListener("click", function () {
    openStationEditor();
  });
  elements.cancelStationEditor.addEventListener("click", closeStationEditor);
  elements.stationForm.addEventListener("submit", saveStation);
  elements.saveSession.addEventListener("click", saveSession);
  elements.exportData.addEventListener("click", exportData);
  elements.importData.addEventListener("click", function () {
    elements.importFile.click();
  });
  elements.importFile.addEventListener("change", function () {
    if (elements.importFile.files[0]) {
      importData(elements.importFile.files[0]);
    }
  });
  elements.downloadHistory.addEventListener("click", function () {
    var slug = getSelectedNet().name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    downloadFile(
      slug + "-history.md",
      historyAsMarkdown(),
      "text/markdown"
    );
    showStatus("History download started.");
  });

  if (!state.nets.some(function (net) { return net.id === state.selectedNetId; })) {
    state.selectedNetId = state.nets[0].id;
  }
  render();
}());
