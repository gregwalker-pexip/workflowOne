import { registerPlugin } from "@pexip/plugin-api";

import type { RPCCallPayload, Participant } from "@pexip/plugin-api";

export const WorkflowGroup: RPCCallPayload<"ui:button:add"> = {
  position: "toolbar",
  icon: "IconMeetings",
  tooltip: "Workflow One",
  roles: ["chair"],
  isActive: true,
  group: [
    {
      id: "manage-participant",
      position: "toolbar",
      icon: "IconMeetingRoom",
      tooltip: "Manage Participant",
      roles: ["chair"],
    },
    {
      id: "location-request",
      position: "toolbar",
      icon: "IconRemoteControl",
      tooltip: "Request Location",
      roles: ["chair"],
    },
    {
      id: "share-statement",
      position: "toolbar",
      icon: "IconEdit",
      tooltip: "Share Statement",
      roles: ["chair"],
      isActive: false,
    },
    {
      id: "approve-statement",
      icon: "IconTranscript",
      position: "toolbar",
      roles: ["chair"],
      tooltip: "Approve Statement",
    },
    {
      id: "meeting-wrapup",
      icon: "IconLeave",
      position: "toolbar",
      roles: ["chair"],
      tooltip: "Meeting Wrap-up",
    },
  ],
};

export const RecordButton: RPCCallPayload<"ui:button:add"> = {
  position: "toolbar",
  icon: "IconStopRound",
  tooltip: "Record Evidence",
  roles: ["chair"],
};

export const GeolocationButton: RPCCallPayload<"ui:button:add"> = {
  position: "toolbar",
  icon: "IconRemoteControl",
  tooltip: "Request Geolocation",
  roles: ["chair"],
};

export const TestButton: RPCCallPayload<"ui:button:add"> = {
  position: "toolbar",
  icon: "IconGroup",
  tooltip: "Manage Person",
  roles: ["chair"],
};

export const GeolocationPrompt: RPCCallPayload<"ui:prompt:open"> = {
  title: "Location Sharing Request",
  description:
    "Please accept this location request for evidence validation purposes.",
  prompt: {
    primaryAction: "Accept",
    secondaryAction: "Dismiss",
  },
};

export const StatementForm = {
  title: "Statement Approval",
  description:
    "I confirm this written police statement as being accurate and true.",
  form: {
    elements: {
      name: {
        placeholder: "Your Full Legal Name",
        type: "text",
        isOptional: false,
      },
      agreement: {
        type: "checklist",
        options: [
          {
            id: "falseStatementCheck",
            label:
              "I understand the concequences of making a false police statement.",
          },
        ],
        isOptional: false,
      },
    },
    id: "submit-signing",
    submitBtnTitle: "SUBMIT",
  },
} as const;

