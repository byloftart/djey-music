import assert from "node:assert/strict";
import test from "node:test";

import { createSiteConfig } from "../lib/site-config";

test("site configuration keeps the shipped DJey Music defaults", () => {
  assert.deepEqual(createSiteConfig({}), {
    name: "DJey Music",
    artistName: "DJey",
    description: "Original music by DJey.",
    brandLead: "DJey",
    brandAccent: "Music",
  });
});

test("one environment change rebrands the player and admin consistently", () => {
  assert.deepEqual(
    createSiteConfig({
      name: "John Doe Music",
      artistName: "John Doe",
      description: "The official John Doe catalog.",
    }),
    {
      name: "John Doe Music",
      artistName: "John Doe",
      description: "The official John Doe catalog.",
      brandLead: "John Doe",
      brandAccent: "Music",
    },
  );
});

test("blank values fall back safely and a one-word brand remains readable", () => {
  assert.deepEqual(
    createSiteConfig({ name: "  Mononym  ", artistName: " ", description: "" }),
    {
      name: "Mononym",
      artistName: "Mononym",
      description: "Original music by Mononym.",
      brandLead: "",
      brandAccent: "Mononym",
    },
  );
});
