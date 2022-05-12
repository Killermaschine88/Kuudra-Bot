const nbt = require("prismarine-nbt");
const util = require("util");
const parseNbt = util.promisify(nbt.parse);
const pako = require("pako");
const nbtFast = require("nbt");

async function itemCheck(inv) {
  let hyperion = false;
  let terminator = false;
  const witherblades = ["SCYLLA", "HYPERION", "ASTRAEA", "VALKYRIE"];

  if (inv.inv_contents.length > 1) {
    //Check Inventory
    for (const item of inv.inv_contents) {
      const id = item.tag.ExtraAttributes.id;
      if (witherblades.includes(id)) hyperion = true;
      if (id === "TERMINATOR") terminator = true;
    }
  }

  if (inv.backpack_contents.length > 1) {
    //Check Backpacks
    for (const item of inv.backpack_contents) {
      const id = item.tag.ExtraAttributes.id;
      if (witherblades.includes(id)) hyperion = true;
      if (id === "TERMINATOR") terminator = true;
    }
  }

  if (inv.ender_chest_contents.length > 1) {
    //Check Ender Chest
    for (const item of inv.ender_chest_contents) {
      const id = item.tag.ExtraAttributes.id;
      if (witherblades.includes(id)) hyperion = true;
      if (id === "TERMINATOR") terminator = true;
    }
  }

  return { hasHyperion: hyperion, hasTerminator: terminator };
}

function getAPIStatus(profile) {
  const member = profile;
  const api = {
    // Not 100% for skills, could just be all at 0
    skills:
      member?.experience_skill_runecrafting !== undefined ||
      member?.experience_skill_mining !== undefined ||
      member?.experience_skill_alchemy !== undefined ||
      member?.experience_skill_taming !== undefined ||
      member?.experience_skill_combat !== undefined ||
      member?.experience_skill_farming !== undefined ||
      member?.experience_skill_enchanting !== undefined ||
      member?.experience_skill_fishing !== undefined ||
      member?.experience_skill_foraging !== undefined ||
      member?.experience_skill_carpentry !== undefined,
    collections: member?.collection !== undefined,
    inventory: member?.inv_contents !== undefined,
    personalVault: member?.personal_vault_contents !== undefined,
    banking: profile?.banking !== undefined,
  };
  api.disabled = Object.keys(api).filter((key) => !api[key]);
  return api;
}

async function decodeAllInventories(profile) {
  const keys = ["inv_armor", "backpack_contents", "quiver", "talisman_bag", "fishing_bag", "ender_chest_contents", "wardrobe_contents", "personal_vault_contents", "inv_contents", "candy_inventory_contents"];

  const inventories = {};
  await Promise.all(
    keys.map(async (key) => {
      if (profile[key]?.data) {
        const contents = await decodeInventory(profile[key].data);
        inventories[key] = cleanEmptySlots(contents);
      } else if (key === "backpack_contents" && profile[key]) {
        const contents = await decodeAllBackpacks(profile[key]);
        inventories[key] = contents;
      }
    })
  );

  return inventories;
}

async function decodeInventory(data) {
  const buffer = Buffer.from(data, "base64");
  const parsedNbt = await parseNbt(buffer);
  return nbt.simplify(parsedNbt).i;
}

async function decodeAllBackpacks(backpackData) {
  let backpacks = [];
  await Promise.all(
    Object.keys(backpackData).map(async (key) => {
      const contents = await decodeInventory(backpackData[key].data);
      const backpackIds = ["SMALL_BACKPACK", "MEDIUM_BACKPACK", "LARGE_BACKPACK", "GREATER_BACKPACK", "JUMBO_BACKPACK"];
      const backpack = { tag: { ExtraAttributes: { id: backpackIds[contents.length / 9 - 1] } } };
      backpacks = [backpack, ...backpacks, ...cleanEmptySlots(contents)];
    })
  );
  return backpacks;
}

function cleanEmptySlots(items) {
  const cleaned = items.reduce((acc, val) => {
    if (Object.keys(val).length !== 0) return [...acc, val];
    else return acc;
  }, []);
  return cleaned;
}

module.exports = { decodeAllInventories, itemCheck, getAPIStatus };
