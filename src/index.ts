import { registerPlugin } from "@pexip/plugin-api";
import { ChecklistElement } from "@pexip/plugin-api";

import { WorkflowGroup, StatementForm, GeolocationPrompt } from "./data";
//import { logger } from "./logger";

//https://gitlab.com/pexip/zoo/-/tree/main/src/aquila/examples

const plugin = await registerPlugin({
  id: "workflow-one-plugin",
  version: 0,
});
let selfUiid = "";
let selfName = "";
let selectedParticipant = "";

let rosterList = null;
let RosterListCount = 0;
let geolocation = null;
let checklistOptions: ChecklistElement["options"]; //Select drop-down

plugin.events.directMessage.add((message) => {
  void plugin.ui.showToast({
    message: `${message.displayName}: ${message.message}`,
  });
  console.log("Direct Message Recieved: ", message);
});

plugin.events.message.add((message) => {
  console.log("Chat Message Recieved:", message);
});

plugin.events.participants.add((participants) => {
  rosterList = participants;
  RosterListCount = participants.length;

  console.log("Roster:", rosterList, "[" + RosterListCount + "]");
});

//const testBtn = await plugin.ui.addButton(TestButton);
//const geolocationBtn = await plugin.ui.addButton(GeolocationButton);
//const recordBtn = await plugin.ui.addButton(RecordButton);

const workflowButton = await plugin.ui.addButton(WorkflowGroup).catch((e) => {
  console.warn(e);
});

workflowButton?.onClick.add(async ({ buttonId }) => {
  if (buttonId === "share-statement") {
    console.log("Share statement link");

    plugin.conference.sendMessage({
      payload:
        "Your Police Statement: " +
        "https://cms.docs.gov.au/doc-123456789.pdf/",
    });
    plugin.ui.showToast({
      message: "Statement link has been shared via chat 💬",
    });

    plugin.conference.sendApplicationMessage({
      payload: { pexCommand: "sharingStatement" },
      participantUuid: selectedParticipant,
    });
  }
  if (buttonId === "approve-statement") {
    console.log("Request statement approval");

    plugin.conference.sendApplicationMessage({
      payload: { pexCommand: "requestSignStatement" },
      participantUuid: selectedParticipant,
    });
    plugin.ui.showToast({
      message: "Approval request sent...",
    });
  }

  if (buttonId === "location-request") {
    plugin.conference.sendApplicationMessage({
      payload: { pexCommand: "requestGeolocation" },
      participantUuid: selectedParticipant,
    });
    plugin.ui.showToast({ message: "Location request pending 📌" });
  }

  if (buttonId === "meeting-wrapup") {
    const input = await plugin.ui.addForm({
      title: "Meeting Wrap-up",
      description: "What would you like to do?",
      form: {
        elements: {
          actionList: {
            name: "Action List:",
            type: "select",
            options: [
              { id: "endMeeting", label: "End Meeting" },
              { id: "leaveMeeting", label: "Leave Meeting" },
              { id: "somethingElse", label: "Something Else Perhaps" },
            ],
          },
        },
        submitBtnTitle: "Apply",
      },
    });

    input.onInput.add((formInput) => {
      var selectedWrapupOption = formInput.actionList;
      console.log("Wrap-up Selection: ", selectedWrapupOption);

      input.remove();

      if (selectedWrapupOption === "endMeeting") {
        var disconnectAll = plugin.conference.disconnectAll({});
        plugin.ui.showToast({ message: "The meeting is ending..." });
      }

      if (selectedWrapupOption === "leaveMeeting") {
        //This needs some attention as not working (me = uuid)

        var disconnectSelf = plugin.conference.disconnect({
          participantUuid: selfUiid,
        });
        plugin.ui.showToast({ message: "You are leaving the meeting..." });
      }

      if (selectedWrapupOption === "somethingElse") {
        plugin.ui.showToast({
          message: "Have a great day 🎈",
        });
      }
    });
  }

  if (buttonId === "manage-participant") {
    console.log("Checklist Options: ", checklistOptions);

    const input = await plugin.ui.addForm({
      title: "Manage Participant",
      description: "Select participant for interaction.",
      form: {
        elements: {
          participantList: {
            name: "Participant:",
            type: "select",
            options: checklistOptions,
          },
          meetingOptions: {
            name: "Meeting Options:",
            type: "checklist",
            options: [
              { id: "spotlightUser", label: "Spotlight User", checked: true },
              {
                id: "spotlightSelf",
                label: "Spotlight Self (secondary)",
                checked: true,
              },
              { id: "focusLayout", label: "Focussed Layout (1:1)" },
              { id: "lockConference", label: "Lock Meeting" },
            ],
          },
        },
        submitBtnTitle: "Apply",
      },
    });

    input.onInput.add((formInput) => {
      selectedParticipant = formInput.participantList;
      //console.log("Selected Participant: ", selectedParticipant);
      //console.log("Meeting Options: ", formInput.meetingOptions);
      input.remove();
      const meetingOptions = formInput.meetingOptions;
      setConference(meetingOptions);
      setSpotlight(meetingOptions);
    });
    //logger.debug(input);
  }
});

plugin.events.me.add((self) => {
  selfUiid = self.uuid;
  selfName = self.displayName;
});

plugin.events.connected.add(() => {
  //plugin.ui.showToast({ message: "You are connected!!!!!" });
});

function setConference(meetingOptions) {
  if (meetingOptions["focusLayout"] === true) {
    var setLayout = plugin.conference.setLayout({
      transforms: { layout: "1:0" },
    });
  } else {
    var setLayout = plugin.conference.setLayout({
      transforms: { layout: "1:7" },
    });
  }

  if (meetingOptions["lockConference"] === true) {
    var lockconference = plugin.conference.lock({
      lock: true,
    });
  } else {
    var lockconference = plugin.conference.lock({
      lock: false,
    });
  }
}

function setSpotlight(meetingOptions) {
  clearAllSpotlights();

  //Spotlight Participants
  if (meetingOptions["spotlightUser"] === true) {
    var setSpotlight = plugin.conference.spotlight({
      enable: true,
      participantUuid: selectedParticipant,
    });
  } else {
    var setSpotlight = plugin.conference.spotlight({
      enable: false,
      participantUuid: selectedParticipant,
    });
  }

  //Spotlight Self
  if (meetingOptions["spotlightSelf"] === true) {
    var setSpotlight = plugin.conference.spotlight({
      enable: true,
      participantUuid: selfUiid,
    });
  } else {
    var setSpotlight = plugin.conference.spotlight({
      enable: false,
      participantUuid: selfUiid,
    });
  }
}

function clearAllSpotlights() {
  try {
    //console.log("Participant List: ", checklistOptions)
    checklistOptions.forEach((element) => {
      var uuid = element.id;
      var setSpotlight = plugin.conference.spotlight({
        enable: false,
        participantUuid: uuid,
      });
    });
  } catch (error) {}
}

const applicationMessageReceiver = plugin.events.applicationMessage.add(
  async (message) => {
    let appMsg = JSON.stringify(message.message);
    console.log("Application Message:", message);

    const applicationSenderID = message.userId;

    if (appMsg.includes("requestGeolocation")) {
      void plugin.ui.showToast({
        message: `${message.displayName} has requested your location 📌`,
      });

      const input = await plugin.ui.showPrompt(GeolocationPrompt);

      if (input === "Accept") {
        const pos = null;
        const geoLoc = navigator.geolocation;

        if (geoLoc) {
          let id = geoLoc.watchPosition(
            (position: Position) => {
              console.log(position);

              let geoInfo =
                "Latitude/Longitude(Accuracy): " +
                position.coords.latitude +
                ", " +
                position.coords.longitude +
                " (" +
                position.coords.accuracy.toFixed() +
                "m)";

              let googleMapLink =
                "https://www.google.com/maps/search/?api=1&query=" +
                position.coords.latitude +
                "," +
                position.coords.longitude;

              console.log(geoInfo);
              console.log(googleMapLink);

              plugin.conference.sendMessage({
                payload:
                  "📌 Location (~" +
                  position.coords.accuracy.toFixed() +
                  "m): " +
                  googleMapLink,
              });

              geoLoc.clearWatch(id);
            },
            (err: PositionError) => {
              plugin.conference.sendMessage({
                payload: "📌 Location not available",

                // + err.message,
              });
              console.log("📌", err);
            },
            {
              enableHighAccuracy: true,
              timeout: 1000,
            }
          );
        }
      } else {
        //On dismiss button
        plugin.conference.sendMessage({
          payload: "📌 Location request denied",
        });
      }
    }

    if (appMsg.includes("sharingStatement")) {
      void plugin.ui.showToast({
        message: `${message.displayName} has shared statement via chat 💬`,
      });
      plugin.conference.sendMessage({
        payload: "🧾 User has recieved statement link for review",
      });
    }

    if (appMsg.includes("requestSignStatement")) {
      void plugin.ui.showToast({
        message: `${message.displayName} Please approve statement `,
      });
      const input = await plugin.ui.addForm(StatementForm);

      input.onInput.add((formInput) => {
        plugin.conference.sendMessage({
          payload: "✅ Statement has been signed: " + formInput.name,
        });
        plugin.conference.sendMessage({
          payload: "✅ Statement has been signed: " + formInput.name,
          participantUuid: applicationSenderID,
        });
        input.remove();
      });
    }
  }
);

// Populates drop-down select list based on active participant (optionally filtered)
plugin.events.participants.add((participants) => {
  const options = participants
    //.filter((participant) => participant.role === "guest")
    .map((participant, index) => ({
      id: participant.uuid,
      label: participant.displayName,
    }));
  checklistOptions = options;
});

plugin.events.participantJoined.add((participant) => {
  void plugin.ui.showToast({
    message: `${participant.displayName} has joined the call 👋`,
  });
});

plugin.events.participantLeft.add((participant) => {
  void plugin.ui.showToast({
    message: `${participant.displayName} has left the call 👋`,
  });
});
